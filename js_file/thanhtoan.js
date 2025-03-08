function generateQRCode() {
    let qrContainer = document.getElementById("qrcode");
    let totalPrice = parseInt(document.getElementById("total-price").innerText.replace(/\D/g, ""), 10) || 0;
    console.log(`Tổng số tiền cần thanh toán: ${totalPrice}đ`);

    let accountNumber = "0932396059"; 
    let bankID = "mb";  

    let paymentMethod = document.getElementById("payment-method").value;

    if (paymentMethod === "bank" || paymentMethod === "momo") {
        let apiUrl = `https://img.vietqr.io/image/${bankID}-${accountNumber}-compact.png?amount=${totalPrice}&addInfo=ThanhToanSanBong`;
        qrContainer.innerHTML = `<img src="${apiUrl}" alt="QR Code">`;
        document.getElementById("qr-form").style.display = "block"; 
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let payButton = document.getElementById("pay-btn");
    if (payButton) {
        payButton.addEventListener("click", generateQRCode);
    } else {
        console.error("Không tìm thấy nút thanh toán!");
    }
});
