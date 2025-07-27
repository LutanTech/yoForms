const BASE_URL = 'http://127.0.0.1:5000'
// const BASE_URL = 'https://yoform.pythonanywhere.com'
const elements = document.querySelectorAll('.draggable-item');
const preview = document.getElementById('formPreview');
const sidebar = document.getElementById('elements');
let draggedFromPalette = null;
let draggedFromPreview = null;
let placeholder = null;
let ghostElement = null;
let currentDragType = null;

const createElementHTML = (type) => {
    const uniqueId = type + '_' + Date.now();
    switch(type) {
    case 'textInput':
        return `<div class="form-element-content"><label contenteditable="true"><i class="fas fa-font mr-1"></i>Text</label><input type="text" id="${uniqueId}"></div>`;

    case 'numberInput':
        return `<div class="form-element-content"><label contenteditable="true"><i class="fas fa-hashtag mr-1"></i>Number</label><input type="number" id="${uniqueId}"></div>`;

    case 'emailInput':
        return `<div class="form-element-content"><label contenteditable="true"><i class="fas fa-envelope mr-1"></i>Email</label><input type="email" id="${uniqueId}"></div>`;

    case 'dateInput':
        return `<div class="form-element-content"><label contenteditable="true"><i class="fas fa-calendar-alt mr-1"></i>Date</label><input type="date" id="${uniqueId}"></div>`;

    case 'passwordInput':
        return `<div class="form-element-content"><label contenteditable="true"><i class="fas fa-lock mr-1"></i>Password</label><input type="password" id="${uniqueId}"></div>`;

    case 'phoneNumberInput':
        return `<div class="form-element-content"><label contenteditable="true"><i class="fas fa-phone-alt mr-1"></i>Phone</label><input type="tel" maxLenght='13'  pattern="[0-9]{7,15}" id="${uniqueId}"></div>`;

    case 'textarea':
        return `<div class="form-element-content"><label contenteditable="true"><i class="fas fa-align-left mr-1"></i>Long message</label><textarea rows="3" id="${uniqueId}"></textarea></div>`;

    case 'checkbox':
        return `<div class="form-element-content"><input type="checkbox" id="${uniqueId}"<label for=${uniqueId}><b contenteditable="true">Checkbox </b></label></div>`;

    case 'radio':
        return `<div class="form-element-content"><label><input type="radio" name="radio-group-${Date.now()}" id="${uniqueId}"><b  contenteditable="true">Option</b></label></div>`;

    case 'select':
        return `<div class="form-element-content">
            <label contenteditable="true"><i class="fas fa-caret-down mr-1"></i>Dropdown Label</label>
            <select id="${uniqueId}" onclick="openOptionModal(this)">
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
            </select>
        </div>`;

    case 'button':
        return `<div class="form-element-content"><button id="${uniqueId}" contenteditable="true"><i class="fas fa-mouse-pointer mr-1"></i>Click Me</button></div>`;

    case 'whatsappButton':
        return `<div class="form-element-content"><button id="${uniqueId}" contenteditable="true"><i class="fab fa-whatsapp mr-1"></i>WhatsApp</button></div>`;

    case 'heading1':
        return `<div class="form-element-content"><h1 contenteditable="true">Heading 1</h1></div>`;

    case 'heading2':
        return `<div class="form-element-content"><h2 contenteditable="true">Heading 2</h2></div>`;

    case 'heading3':
        return `<div class="form-element-content"><h3 contenteditable="true">Heading 3</h3></div>`;

    case 'paragraph':
        return `<div class="form-element-content"><p contenteditable="true"><i class="fas fa-paragraph mr-1"></i>This is a paragraph of text.</p></div>`;

    case 'boldText':
        return `<div class="form-element-content"><strong contenteditable="true">Bold Text</strong></div>`;

    case 'image':
        return `<div class="form-element-content"><label contenteditable="true" data-builder-only-label="true"><i class="fas fa-image mr-1"></i>Image URL:</label><input type="text" data-builder-only="true" placeholder="Paste image URL" onblur="this.nextElementSibling.src = this.value || 'https://placehold.co/200x150/e0e0e0/000000?text=Placeholder'" value="https://placehold.co/200x150/e0e0e0/000000?text=Placeholder"><img style="width:100%;margin-top:10px;" src="https://placehold.co/200x150/e0e0e0/000000?text=Placeholder" /></div>`;

    case 'video':
        return `<div class="form-element-content"><label contenteditable="true" data-builder-only-label="true"><i class="fas fa-video mr-1"></i>Video URL:</label><input type="text" data-builder-only="true" placeholder="Paste video URL" onblur="this.nextElementSibling.src = this.value || 'https://www.youtube.com/embed/dQw4w9WgXcQ'" value="https://www.youtube.com/embed/dQw4w9WgXcQ"><iframe style="width:100%;aspect-ratio:16/9;margin-top:10px;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe></div>`;

        default:
            return `<div class="form-element-content"><div>Unknown Element</div></div>`;
    }
};

const createGhostElement = (originalElement) => {
    const ghost = originalElement.cloneNode(true);
    ghost.classList.add('ghost-element');
    ghost.style.width = originalElement.offsetWidth + 'px';
    ghost.style.height = originalElement.offsetHeight + 'px';
    document.body.appendChild(ghost);
    return ghost;
};

const updateGhostPosition = (e) => {
    if (ghostElement) {
        ghostElement.style.left = e.touches[0].clientX - ghostElement.offsetWidth / 2 + 'px';
        ghostElement.style.top = e.touches[0].clientY - ghostElement.offsetHeight / 2 + 'px';
    }
};

const clearGhost = () => {
    if (ghostElement && ghostElement.parentNode) {
        ghostElement.parentNode.removeChild(ghostElement);
        ghostElement = null;
    }
};

elements.forEach(el => {
    el.addEventListener('dragstart', e => {
        draggedFromPalette = el.dataset.type;
        e.dataTransfer.setData('text/plain', draggedFromPalette);
        e.target.classList.add('is-dragging-palette');
    });
    el.addEventListener('dragend', e => {
        e.target.classList.remove('is-dragging-palette');
        draggedFromPalette = null;
    });

    el.addEventListener('touchstart', e => {
        e.preventDefault();
        currentDragType = 'palette';
        draggedFromPalette = el.dataset.type;
        ghostElement = createGhostElement(el);
        updateGhostPosition(e);
        sidebar.classList.remove('show');
    }, { passive: false });

    el.addEventListener('touchmove', e => {
        e.preventDefault();
        updateGhostPosition(e);
        const touchY = e.touches[0].clientY;
        const afterElement = getDragAfterElement(preview, touchY);
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'drag-placeholder';
        }
        if (afterElement == null) {
            preview.appendChild(placeholder);
        } else {
            preview.insertBefore(placeholder, afterElement);
        }
    }, { passive: false });

    el.addEventListener('touchend', e => {
        e.preventDefault();
        clearGhost();
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
        const touchY = e.changedTouches[0].clientY;
        const previewRect = preview.getBoundingClientRect();

        if (touchY > previewRect.top && touchY < previewRect.bottom &&
            e.changedTouches[0].clientX > previewRect.left && e.changedTouches[0].clientX < previewRect.right) {
            
            const initialMessage = preview.querySelector('.initial-message');
            if (initialMessage) {
                initialMessage.remove();
            }

            const type = draggedFromPalette;
            const elem = document.createElement('div');
            elem.className = 'form-element';
            elem.innerHTML = createElementHTML(type);
            elem.dataset.type = type;

            makeFormElementDraggable(elem);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-element-button';
            removeBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
            removeBtn.addEventListener('click', () => {
                elem.remove();
                if (preview.children.length === 0) {
                    preview.innerHTML = '<p class="initial-message">Drop elements here to build your form!</p>';
                }
            });
            elem.appendChild(removeBtn);

            const afterElement = getDragAfterElement(preview, touchY);
            if (afterElement == null) {
                preview.appendChild(elem);
            } else {
                preview.insertBefore(elem, afterElement);
            }

        }
        draggedFromPalette = null;
        currentDragType = null;
    });
    el.addEventListener('touchcancel', () => {
        clearGhost();
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
        draggedFromPalette = null;
        currentDragType = null;
    });
});

const makeFormElementDraggable = (element) => {
    element.setAttribute('draggable', 'true');
    element.dataset.draggableId = 'element_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
    element.insertBefore(dragHandle, element.firstChild);

    const existingContent = element.querySelector('.form-element-content');
    if (!existingContent) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-element-content';
        while (element.firstChild && element.firstChild !== dragHandle) {
            wrapper.appendChild(element.firstChild);
        }
        element.appendChild(wrapper);
    }
    

    dragHandle.addEventListener('dragstart', e => {
        draggedFromPreview = element;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', element.dataset.draggableId);
        element.classList.add('is-dragging');
        // element.style.visibility = 'hidden'; /* Set visibility to hidden during dragstart for mouse */
    });
    dragHandle.addEventListener('dragend', e => {
        if (draggedFromPreview) {
            draggedFromPreview.classList.remove('is-dragging');
            // draggedFromPreview.style.visibility = 'visible'; /* Reset visibility on dragend for mouse */
        }
        draggedFromPreview = null;
    });

    dragHandle.addEventListener('touchstart', e => {
        e.preventDefault(); 
        currentDragType = 'preview';
        draggedFromPreview = element;
        ghostElement = createGhostElement(element);
        updateGhostPosition(e);
        element.style.visibility = 'hidden';
    }, { passive: false });

    dragHandle.addEventListener('touchmove', e => {
        e.preventDefault();
        updateGhostPosition(e);
        const touchY = e.touches[0].clientY;
        const afterElement = getDragAfterElement(preview, touchY);
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'drag-placeholder';
        }
        /* Only move placeholder if its position needs to change */
        if (afterElement == null) {
            if (preview.lastChild !== placeholder) { /* Check if already last child */
                preview.appendChild(placeholder);
            }
        } else {
            if (placeholder.nextSibling !== afterElement || placeholder.previousSibling !== afterElement) { /* Check if already before afterElement */
                preview.insertBefore(placeholder, afterElement);
            }
        }
    }, { passive: false });

    dragHandle.addEventListener('touchend', e => {
        e.preventDefault();
        clearGhost();
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }

        if (draggedFromPreview) {
            element.style.visibility = ''; /* Reset visibility directly on original element */
            const touchY = e.changedTouches[0].clientY;
            const afterElement = getDragAfterElement(preview, touchY);

            if (draggedFromPreview && draggedFromPreview !== afterElement) {
                if (afterElement == null) {
                    preview.appendChild(draggedFromPreview);
                } else {
                    preview.insertBefore(draggedFromPreview, afterElement);
                }
            }
            draggedFromPreview.classList.remove('is-dragging');
            draggedFromPreview = null;
        }
        currentDragType = null;
    }, { passive: false });
    dragHandle.addEventListener('touchcancel', () => {
        clearGhost();
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
        if (draggedFromPreview) {
            draggedFromPreview.style.visibility = ''; /* Reset visibility directly on original element */
            draggedFromPreview.classList.remove('is-dragging');
        }
        draggedFromPreview = null;
        currentDragType = null;
    });
};

preview.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedFromPalette ? 'copy' : 'move';

    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder';
    }
    // Always remove placeholder first to ensure clean insertion
    if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }

    const afterElement = getDragAfterElement(preview, e.clientY);
    if (afterElement == null) {
        preview.appendChild(placeholder);
    } else {
        preview.insertBefore(placeholder, afterElement);
    }
});

preview.addEventListener('dragleave', () => {
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }
});

preview.addEventListener('drop', e => {
    e.preventDefault();
    const initialMessage = preview.querySelector('.initial-message');
    if (initialMessage) {
        initialMessage.remove();
    }

    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }

    if (draggedFromPalette) {
        const type = e.dataTransfer.getData('text/plain');
        const elem = document.createElement('div');
        elem.className = 'form-element';
        elem.innerHTML = createElementHTML(type);
        elem.dataset.type = type;

        makeFormElementDraggable(elem);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-element-button';
        removeBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
        removeBtn.addEventListener('click', () => {
            elem.remove();
            if (preview.children.length === 0) {
                 preview.innerHTML = '<p class="initial-message">Drop elements here to build your form!</p>';
            }
        });
        elem.appendChild(removeBtn);

        const afterElement = getDragAfterElement(preview, e.clientY);
        if (afterElement == null) {
            preview.appendChild(elem);
        } else {
            preview.insertBefore(elem, afterElement);
        }

        draggedFromPalette = null;

    } else if (draggedFromPreview) {
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedEl = preview.querySelector(`[data-draggable-id="${draggedId}"]`);
        
        const afterElement = getDragAfterElement(preview, e.clientY);

        if (draggedEl && draggedEl !== afterElement) {
            if (afterElement == null) {
                preview.appendChild(draggedEl);
            } else {
                preview.insertBefore(draggedEl, afterElement);
            }
        }
        draggedFromPreview.classList.remove('is-dragging');
        draggedFromPreview = null;
    }
});

function getDragAfterElement(container, clientY) {
    const draggableElements = [...container.querySelectorAll('.form-element:not(.is-dragging):not([style*="visibility: hidden"])')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const midPoint = box.top + box.height / 2;

        if (clientY < midPoint) { /* Mouse/touch is above the midpoint */
            /* Calculate offset as difference from midPoint. Smaller absolute offset is closer. */
            const offset = midPoint - clientY;
            if (offset < closest.offset) {
                return { offset: offset, element: child };
            }
        }
        return closest;
    }, { offset: Infinity, element: null }).element; /* Initialize with Infinity to find smallest positive offset */
}

preview.querySelectorAll('.form-element').forEach(makeFormElementDraggable);

function toggleSidebar() {
    sidebar.classList.toggle('show');
}

function generateHTML(formid) {
    const tempContainer = document.createElement('div');
    Array.from(preview.children).forEach(child => {
        if (child.classList.contains('initial-message') || child.id === 'formName' || (child.tagName === 'H3' && child.textContent.includes('Form Name:'))) {
            return;
        }

        const cleanedElement = child.cloneNode(true);

        cleanedElement.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        cleanedElement.querySelectorAll('.remove-element-button').forEach(el => el.remove());
        cleanedElement.querySelectorAll('.drag-handle').forEach(el => el.remove());
        cleanedElement.removeAttribute('draggable');
        cleanedElement.removeAttribute('data-draggable-id');
        cleanedElement.removeAttribute('data-type');
        cleanedElement.classList.remove('is-dragging');
        cleanedElement.style.display = '';
        cleanedElement.style.alignItems = '';
        cleanedElement.style.gap = '';


        const contentWrapper = cleanedElement.querySelector('.form-element-content');
        if (contentWrapper) {
            const builderOnlyInput = contentWrapper.querySelector('[data-builder-only="true"]');
            if (builderOnlyInput) {
                const associatedLabel = contentWrapper.querySelector('[data-builder-only-label="true"]');
                if (associatedLabel) {
                    associatedLabel.remove();
                }
                builderOnlyInput.remove();
            }

            const mediaElement = contentWrapper.querySelector('img, iframe');
            if (mediaElement) {
                mediaElement.removeAttribute('contenteditable');
                mediaElement.style.outline = '';
                mediaElement.style.cursor = '';
            }

            while (contentWrapper.firstChild) {
                cleanedElement.insertBefore(contentWrapper.firstChild, contentWrapper);
            }
            contentWrapper.remove();
        }

        if (cleanedElement.children.length === 0 && !cleanedElement.textContent.trim()) {
             cleanedElement.remove();
        } else {
            tempContainer.appendChild(cleanedElement);
        }
    });

    tempContainer.querySelectorAll('label').forEach(label => {
        const input = label.nextElementSibling;
        if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT')) {
            const uniqueId = label.textContent.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substring(2, 9);
            input.id = uniqueId;
            label.setAttribute('for', uniqueId);
        } else if (label.querySelector('input[type="checkbox"], input[type="radio"]')) {
            const checkboxRadio = label.querySelector('input[type="checkbox"], input[type="radio"]');
            const uniqueId = label.textContent.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substring(2, 9);
            checkboxRadio.id = uniqueId;
            label.setAttribute('for', uniqueId);
        }
    });

    const html = tempContainer.innerHTML;
    const styled = `<style>.form-element-content h1,
.form-element-content h2,
.form-element-content h3{
    font-weight: 900;
    text-align: left !important;
}
.form-element-content h3{
    font-size: small;
}
.form-element-content h2{
    font-size: large;
}
.form-element-content h1{
    font-size: x-large;
}</style><form style="padding:20px;max-width:600px;margin:20px auto;border:1px solid #ccc;width:100%;border-radius:8px;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,0.1);">${html}</form><style>body{font-family:sans-serif;padding:0;margin:0;background:#f9f9f9}.form-element{margin-bottom:15px;padding:10px;border:1px solid #eee;border-radius:5px;}input,textarea,button,select{width:100%;padding:10px;margin-top:5px;border:1px solid #ccc;border-radius:4px}</style>`;
    
    localStorage.setItem('generatedFormHtml', styled);
    const id = localStorage.getItem('id')

    const name = document.getElementById('formName').value.trim()
    if(!id || !name || !styled){
        customModal('Missing fields, Please Confirm You have edited the Form Name', 'error')
        return
    }
    if(formid){
        updateForm(id)
    } else{
    Publish(id,styled, name)
}
}
async function updateForm() {
const name = document.getElementById('formName').value.trim();
if (!name) return customModal('Missing title!', 'error');
let htmlToSave = '';
formPreview.querySelectorAll('.form-element').forEach(el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
    const grip = clone.querySelector('.fa-grip-lines')?.parentElement;
    if (grip) grip.remove();
    htmlToSave += clone.innerHTML;
});
const formId = new URLSearchParams(window.location.search).get('id');
const res = await fetch(`${BASE_URL}/api/update_form/${formId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, html: htmlToSave })
});
const result = await res.json();
if (result.message) alert('✅ Form updated!');
else alert('⚠️ Failed to update');
}

async function Publish(id, fullHTML, name) {
    loading()
    // document.getElementById('publish').innerText = 'Pubishing'
try {
const res = await fetch(`${BASE_URL}/api/save-form`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        user_id: id,      
        html: fullHTML,
        name:name
    })
});

const data = await res.json();

if (!res.ok || data.error) {
    customModal(data.error || 'Something went wrong 😬', 'error', 1000);
    loading()

} else {
    customModal(data.message || 'Publish successful 🎉', 'success');
    loading()
}
} catch (err) {
console.error('Publish failed:', err);
customModal('Network error or server is offline 😵‍💫', 'error');
loading()
}
} 


let currentSelectElement = null;

function openOptionModal(selectEl) {
  currentSelectElement = selectEl;
  const existingOptions = Array.from(selectEl.options).map(opt => opt.text).join(', ');
  document.getElementById('optionInput').value = existingOptions;
  document.getElementById('optionModal').classList.remove('hidden');
  document.getElementById('optionModal').classList.add('flex');

}

function closeOptionModal() {
  document.getElementById('optionModal').classList.add('hidden');
  document.getElementById('optionModal').classList.remove('flex');
  document.getElementById('optionInput').value = '';
  currentSelectElement = null;
}

function saveOptions() {
  const rawInput = document.getElementById('optionInput').value;
  const options = rawInput.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
  if (currentSelectElement) {
    currentSelectElement.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
  }
  closeOptionModal();
}



// editing
(async () => {
const BASE_URL = 'http://127.0.0.1:5000';
const urlParams = new URLSearchParams(window.location.search);
const isEditMode = urlParams.get('edit_mode') === 'true';
const formId = urlParams.get('id');

if (isEditMode && formId) {
try {
const res = await fetch(`${BASE_URL}/api/get_form/${formId}`);
const data = await res.json();
if (data.error) {
  alert("⚠️ Form not found!");
  return;
}

// Fill title
const formNameInput = document.getElementById('formName');
if (formNameInput) formNameInput.value = data.name || '';
const publishBtn = document.getElementById('publish');
if (publishBtn) publishBtn.setAttribute('onclick', `generateHTML('${formId}')`);

// Parse HTML and inject
const parser = new DOMParser();
const doc = parser.parseFromString(data.html, 'text/html');
const formPreview = document.getElementById('formPreviewInner');
if (!formPreview) return;

formPreview.innerHTML = '';
doc.body.childNodes.forEach(node => {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const wrapper = document.createElement('div');
    wrapper.className = ' bg-gray-50 border border-dashed border-gray-400 p-3 rounded mb-3 cursor-move';
    wrapper.innerHTML = node.outerHTML ;
    wrapper.classList.add('form-element')
    const els = formPreview.querySelectorAll('.form-element');
    els.forEach(el=>{
        el.setAttribute('draggable', 'true')
        el.style.cursor = 'grab'
        el.className.replace('_content', '')
        el.classList.add('form-element')

    })

    const labels = wrapper.querySelectorAll('label');
    if (labels){
        labels.forEach(label=>{
         label.setAttribute('contenteditable', 'true');
        })
    }
    formPreview.appendChild(wrapper);
  }
});

if (typeof addDragDropListeners === 'function') addDragDropListeners();
} catch (err) {
console.error('🧨 Error loading form:', err);
alert("🚫 Failed to load form!");
}
}
})();