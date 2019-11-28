export interface OrderTableProviderInterface {
    updateReport(orderUuid: string, userUuid: string, newReport: any): Promise<any>
}
