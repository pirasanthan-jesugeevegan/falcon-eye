export interface WorkflowInputOption {
  value: string;
  label: string;
}

export interface WorkflowInputSchema {
  name: string;
  type: 'string' | 'select' | 'boolean' | 'number';
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  options?: WorkflowInputOption[];
}

export interface GithubConfig {
  id?: string;
  owner: string;
  repo: string;
  workflow: string;
  pat: string;
  inputsSchema?: WorkflowInputSchema[];
  defaultRef?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowRun {
  id: number;
  run_number: number;
  status: string;
  conclusion?: string | null;
  created_at: string;
  updated_at: string;
  display_title: string;
  path: string;
  actor?: {
    login: string;
  };
  head_branch: string;
  html_url: string;
}

export interface GithubConfigResponse {
  success: boolean;
  message: string;
  config: GithubConfig;
}
