import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { decrypt } from '../../crypto.util';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 10000,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });
  }

  // Build inputs: convert according to input schema (string[], boolean -> string)
  buildInputsForGitHub(
    schema: any[],
    providedInputs: Record<string, any> = {},
  ) {
    const inputs: Record<string, string> = {};
    for (const def of schema || []) {
      const name = def.name;
      let val = providedInputs?.[name];
      if (val === undefined || val === null) {
        val = def.default;
      }
      if (val === undefined) continue; // omit
      switch (def.type) {
        case 'string':
          inputs[name] = String(val);
          break;
        case 'string[]':
          // Option A: serialize as JSON array string -> workflow must parse JSON
          inputs[name] = Array.isArray(val) ? JSON.stringify(val) : String(val);
          break;
        case 'boolean':
          // Store as "true" | "false"
          inputs[name] = val === true || val === 'true' ? 'true' : 'false';
          break;
        default:
          inputs[name] = String(val);
      }
    }
    return inputs;
  }

  // Trigger the workflow. patEncrypted is stored in DB; decrypt first.
  async triggerWorkflow(
    owner: string,
    repo: string,
    workflow: string,
    ref: string,
    inputs: Record<string, string>,
    encryptedPat: string,
  ) {
    const pat = decrypt(encryptedPat);
    console.log('pat', pat);

    const url = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`;
    const body = { ref, inputs };
    const headers = {
      Authorization: `token ${pat}`,
      Accept: 'application/vnd.github+json',
    };

    // simple retry policy with exponential backoff
    let attempt = 0;
    const maxAttempts = 4;
    const backoff = (n: number) => Math.pow(2, n) * 500;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        const resp = await this.axiosInstance.post(url, body, { headers });
        // GitHub returns 204 if accepted
        return resp.status;
      } catch (err: any) {
        const status = err?.response?.status;
        // handle rate limit or server error
        if (status === 401 || status === 403) {
          // invalid token or insufficient scopes
          this.logger.error(
            `GitHub auth error: ${status} ${err?.response?.data}`,
          );
          throw err;
        }
        if (status === 422) {
          // validation error (e.g. ref not found)
          this.logger.error(
            `GitHub validation error: ${JSON.stringify(err?.response?.data)}`,
          );
          throw err;
        }
        // retry on 5xx or network issues
        if (!status || (status >= 500 && status < 600) || status === 429) {
          const wait = backoff(attempt);
          this.logger.warn(
            `Attempt ${attempt} failed with ${status}. Retrying after ${wait}ms`,
          );
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        // other errors: bubble up
        throw err;
      }
    }
    throw new Error('Max retry attempts exhausted');
  }

  // Get workflow runs for a repository
  async getWorkflowRuns(
    owner: string,
    repo: string,
    workflow: string,
    encryptedPat: string,
    per_page: number = 10,
  ) {
    try {
      const pat = decrypt(encryptedPat);
      const url = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflow)}/runs`;

      const response = await this.axiosInstance.get(url, {
        headers: { Authorization: `token ${pat}` },
        params: { per_page },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get workflow runs: ${error.message}`);
      throw error;
    }
  }

  // Get specific workflow run details
  async getWorkflowRun(
    owner: string,
    repo: string,
    runId: string,
    encryptedPat: string,
  ) {
    try {
      const pat = decrypt(encryptedPat);
      const url = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs/${runId}`;

      const response = await this.axiosInstance.get(url, {
        headers: { Authorization: `token ${pat}` },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get workflow run: ${error.message}`);
      throw error;
    }
  }

  // Validate GitHub configuration (repository and workflow access)
  async validateConfig(
    owner: string,
    repo: string,
    workflow: string,
    encryptedPat: string,
  ) {
    try {
      const pat = decrypt(encryptedPat);

      // Validate repository access
      const repoUrl = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
      const repoResponse = await this.axiosInstance.get(repoUrl, {
        headers: { Authorization: `token ${pat}` },
      });

      // Validate workflow exists
      const workflowUrl = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflow)}`;
      const workflowResponse = await this.axiosInstance.get(workflowUrl, {
        headers: { Authorization: `token ${pat}` },
      });

      return {
        isValid: true,
        apiResponse: {
          repository: repoResponse.data,
          workflow: workflowResponse.data,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        apiResponse: {
          error: error.response?.data || error.message,
          status: error.response?.status,
        },
      };
    }
  }
}
