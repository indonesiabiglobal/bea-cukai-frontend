export interface Pagination {
	page: number;
	rowsPerPage: number;
	totalRecords: number;
	nextPageUrl: string;
	prevPageUrl: string;
}