const modalOverlay = document.getElementById('customModalOverlay');
const modalContent = document.getElementById('customModalContent');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCloseButton = document.getElementById('modalCloseButton');

const customModal = (message, type, timeout) => {
    modalMessage.textContent = message;
    modalContent.classList.remove('success', 'error');
    if (type === 'success') {
        modalTitle.textContent = 'Success!';
        modalContent.classList.add('success');
    }
    else if (type === 'info') {
        modalTitle.textContent = 'Info';
        modalContent.classList.add('info');
    } else {
        modalTitle.textContent = 'Error!';
        modalContent.classList.add('error');
    }
    modalOverlay.classList.add('show');

    if(!timeout){
    setTimeout(() => {
        modalOverlay.classList.remove('show');
    }, 5000);
}
};

modalCloseButton.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
});