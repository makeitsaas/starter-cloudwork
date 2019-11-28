export interface OrderTableProviderInterface {
    updateReport(orderUuid: string, newReport: any): Promise<any>
}
