// import { z } from 'zod';

// // =============================================================================
// // SHARED VALIDATION SCHEMAS
// // =============================================================================

// // Product validation schema
// export const productValidationSchema = z.object({
//   productName: z.string().min(1, { message: 'Product name is required.' }),
//   icon: z.string().optional(),
//   path: z.string().optional(),
//   isActive: z.boolean().optional(),
// });

// // Jira Config validation schema
// export const jiraConfigValidationSchema = z.object({
//   instanceName: z.string().min(1, { message: 'Instance name is required.' }),
//   baseUrl: z
//     .string()
//     .url({ message: 'Please enter a valid URL.' })
//     .refine(val => val.endsWith('/'), {
//       message: 'URL must end with a forward slash (/).',
//     }),
//   email: z
//     .string()
//     .email({ message: 'Please enter a valid email address.' })
//     .or(z.literal('')),
//   apiToken: z.string().min(1, { message: 'API token is required.' }),
//   projectKey: z.string().optional(),
// });

// // SonarCloud Config validation schema
// export const sonarCloudConfigValidationSchema = z.object({
//   instanceName: z.string().min(1, { message: 'Instance name is required.' }),
//   baseUrl: z
//     .string()
//     .url({ message: 'Please enter a valid URL.' })
//     .refine(val => !val.endsWith('/'), {
//       message: 'URL must **not** end with a forward slash (/).',
//     }),
//   apiToken: z.string().min(1, { message: 'API token is required.' }),
// });

// // GitHub Config validation schema
// export const githubConfigValidationSchema = z.object({
//   owner: z.string().min(1, { message: 'Owner is required.' }),
//   repo: z.string().min(1, { message: 'Repo is required.' }),
//   workflow: z.string().min(1, { message: 'Workflow is required.' }),
//   pat: z.string().optional(),
//   inputsSchema: z
//     .array(
//       z.object({
//         name: z.string().min(1, { message: 'Name is required.' }),
//         type: z.enum(['string', 'select', 'boolean', 'number']),
//         defaultValue: z.string().optional(),
//         options: z
//           .array(
//             z.object({
//               value: z.string(),
//               label: z.string(),
//             }),
//           )
//           .optional(),
//       }),
//     )
//     .optional(),
//   defaultRef: z.string().optional(),
// });

// // Jira Query validation schema
// export const jiraQueryValidationSchema = z.object({
//   name: z.string().min(1, { message: 'Query name is required.' }),
//   jqlQuery: z.string().min(1, { message: 'JQL query is required.' }),
//   description: z.string().optional(),
//   isActive: z.boolean(),
//   jiraConfigId: z.string().optional(),
// });

// // SonarCloud Query validation schema
// export const sonarCloudQueryValidationSchema = z.object({
//   name: z.string().min(1, { message: 'Query name is required.' }),
//   project: z.string().min(1, { message: 'Project is required.' }),
//   metric: z
//     .array(z.enum(['pull_request', 'project_status']))
//     .min(1, { message: 'Select at least one metric.' }),
//   description: z.string().optional(),
//   isActive: z.boolean(),
//   sonarCloudConfigId: z.string().optional(),
// });

// // Dynamic form schema generator for GitHub workflows
// export const generateWorkflowFormSchema = (
//   inputsSchema: Array<{
//     name: string;
//     type: 'string' | 'select' | 'boolean' | 'number';
//   }>,
// ) => {
//   const schemaFields: Record<string, z.ZodTypeAny> = {};

//   inputsSchema.forEach(input => {
//     switch (input.type) {
//       case 'string':
//         schemaFields[input.name] = z
//           .string()
//           .min(1, { message: `${input.name} is required` });
//         break;
//       case 'number':
//         schemaFields[input.name] = z
//           .string()
//           .min(1, { message: `${input.name} is required` });
//         break;
//       case 'boolean':
//         schemaFields[input.name] = z.boolean().optional();
//         break;
//       case 'select':
//         schemaFields[input.name] = z
//           .string()
//           .min(1, { message: `${input.name} is required` });
//         break;
//       default:
//         schemaFields[input.name] = z
//           .string()
//           .min(1, { message: `${input.name} is required` });
//     }
//   });

//   return z.object(schemaFields);
// };
