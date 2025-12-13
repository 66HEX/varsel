export type VarselToastPosition =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'top-center'
	| 'bottom-center';

export interface VarselToastOptions {
	position: VarselToastPosition;
	max: number;
}
