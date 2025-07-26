const modalDOverlay = document.getElementById('deleteOverlayWrapper');
const modalDCloseButton = document.querySelector('.closeDeleteOverlayBtn');
const Mtext = document.querySelector('#deleteTextH')

const agree = document.querySelector('#confirm')
const reject = document.querySelector('#reject')

function askConfirm(text, fn){
    if(text && fn){
        Mtext.innerHTML = text
        modalDOverlay.classList.toggle('none')
        modalDOverlay.classList.toggle('flex')
        reject.setAttribute('onclick', `Nc('true')`)
        agree.setAttribute('onclick', fn)
    }
}
function toggleDO(){
    modalDOverlay.classList.toggle('none')
    modalDOverlay.classList.toggle('flex')
}
function Nc(fn){
    if(fn)
        customModal('Operation cancelled', 'info')
        toggleDO()
    return
}

function Continue(fn, choice){
    if(fn && choice){
        if(choice == 'true'){
            alert(fn)
        } else if(!choice){
            return
            
        }

    }
}

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