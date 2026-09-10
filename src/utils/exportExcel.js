import * as XLSX from 'xlsx'

export function exportDashboardToExcel({ books, orders, filename = '교재주문집계.xlsx' }) {
  const workbook = XLSX.utils.book_new()

  const bookSheetData = books.map((book, index) => ({
    순위: index + 1,
    교재명: book.productName,
    주문건수: book.orderCount,
    주문수량: book.orderQty,
    주문금액: book.orderAmount,
    '비중(%)': Number(book.ratio.toFixed(1)),
  }))
  const bookSheet = XLSX.utils.json_to_sheet(bookSheetData)
  XLSX.utils.book_append_sheet(workbook, bookSheet, '교재별집계')

  const orderSheetData = orders.map((order) => ({
    주문일: order.orderDate,
    상품명: order.productName,
    수량: order.quantity,
    상품가격: order.price,
    판매채널: order.channel,
    배송상태: order.deliveryStatus,
  }))
  const orderSheet = XLSX.utils.json_to_sheet(orderSheetData)
  XLSX.utils.book_append_sheet(workbook, orderSheet, '원본주문내역')

  XLSX.writeFile(workbook, filename)
}

export function exportCancelReturnsToExcel({ books, records, filename = '주문취소반품집계.xlsx' }) {
  const workbook = XLSX.utils.book_new()

  const bookSheetData = books.map((book, index) => ({
    순위: index + 1,
    교재명: book.productName,
    건수: book.count,
    수량: book.qty,
    '비중(%)': Number(book.ratio.toFixed(1)),
  }))
  const bookSheet = XLSX.utils.json_to_sheet(bookSheetData)
  XLSX.utils.book_append_sheet(workbook, bookSheet, '교재별집계')

  const recordSheetData = records.map((r) => ({
    신청일: r.claimDate,
    상품명: r.productName,
    수량: r.quantity,
    구분: r.claimType,
    사유: r.reason,
    처리상태: r.status,
    판매채널: r.channel,
  }))
  const recordSheet = XLSX.utils.json_to_sheet(recordSheetData)
  XLSX.utils.book_append_sheet(workbook, recordSheet, '원본내역')

  XLSX.writeFile(workbook, filename)
}
