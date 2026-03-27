/**
 * This module exists solely to make the DntForms namespace extensible
 * with declaration merging:
 *
 * ```ts
 * declare module '@dnt-theme/forms' {
 *     export namespace DntForms {
 * 		     export interface Modal {
 * 		         id: number;
 * 		         // ...
 * 	       }
 * 	   }
 * }
 * ```
 *
 * The huge upside is that consumers of @dnt-theme/forms may extend the
 * exported data types using interface merging as follows:
 *
 * ```ts
 * import type { ModalProps as BaseProps } from '@dnt-theme/forms;
 * declare module '@dnt-theme/forms' {
 *     export namespace DntForms {
 *         export interface ModalProps extends BaseProps {
 *             numberOfViews: number;
 *         }
 *     }
 * }
 *
 * ```
 */
export namespace DntForms {}
