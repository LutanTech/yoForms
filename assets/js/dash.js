const icon = document.querySelector('.menu-icon')
icon.addEventListener('click', (e)=>{
  if(icon.contains(e.target) || icon == e.target){
    document.querySelector('.sidebar').classList.toggle('visible')
  }
})
          // const BASE_URL = 'https://yoform.pythonanywhere.com'
          const BASE_URL = 'http://127.0.0.1:5000'

      document.addEventListener('DOMContentLoaded', () => {

          const body = document.body;
          const header = document.querySelector('.header');
          const navLinks = document.querySelectorAll('header nav a');
          const footerText = document.querySelector('footer p');
          const lutanLogo = document.querySelector('.lutan-logo');
          const container = document.querySelector('.container');

          const formsList = document.getElementById('formsList');
          const loadingMessage = document.getElementById('loadingMessage');
          const errorMessage = document.getElementById('errorMessage');
          const noFormsMessage = document.getElementById('noFormsMessage');
          const logoutLink = document.getElementById('logoutLink');

          // Modal elements
          const modalOverlay = document.getElementById('customModalOverlay');
          const modalContent = document.getElementById('customModalContent');
          const modalTitle = document.getElementById('modalTitle');
          const modalMessage = document.getElementById('modalMessage');
          const modalCloseButton = document.getElementById('modalCloseButton');

          const enableDarkMode = () => {
              body.classList.add('dark-mode');
              body.classList.remove('bg-gray-100', 'text-gray-800');
              body.classList.add('bg-gray-900', 'text-gray-200');

              header.classList.remove('bg-white', 'border-gray-200', 'shadow-md');
              header.classList.add('bg-gray-800', 'border-gray-700', 'shadow-xl');

              navLinks.forEach(link => {
                  link.classList.remove('text-gray-700', 'hover:text-blue-600');
                  link.classList.add('text-gray-300', 'hover:text-blue-400');
              });

              footerText.classList.remove('text-gray-600');
              footerText.classList.add('text-gray-400');

              lutanLogo.classList.remove('text-blue-600', 'border-gray-200');
              lutanLogo.classList.add('text-blue-400', 'border-gray-700');

              container.classList.remove('bg-white', 'border-gray-300', 'shadow-lg');
              container.classList.add('bg-gray-800', 'border-gray-700', 'shadow-xl');
          };

          const disableDarkMode = () => {
              body.classList.remove('dark-mode');
              body.classList.remove('bg-gray-900', 'text-gray-200');
              body.classList.add('bg-gray-100', 'text-gray-800');

              header.classList.remove('bg-gray-800', 'border-gray-700', 'shadow-xl');
              header.classList.add('bg-white', 'border-gray-200', 'shadow-md');

              navLinks.forEach(link => {
                  link.classList.remove('text-gray-300', 'hover:text-blue-400');
                  link.classList.add('text-gray-700', 'hover:text-blue-600');
              });

              footerText.classList.remove('text-gray-400');
              footerText.classList.add('text-gray-600');

              lutanLogo.classList.remove('text-blue-400', 'border-gray-700');
              lutanLogo.classList.add('text-blue-600', 'border-gray-200');

              container.classList.remove('bg-gray-800', 'border-gray-700', 'shadow-xl');
              container.classList.add('bg-white', 'border-gray-300', 'shadow-lg');
          };

          if (localStorage.getItem('darkMode') === 'enabled') {
              enableDarkMode();
          } else {
              disableDarkMode();
          }

          const customModal = (message, type) => {
              modalMessage.textContent = message;
              modalContent.classList.remove('success', 'error');
              if (type === 'success') {
                  modalTitle.textContent = 'Success!';
                  modalContent.classList.add('success');
              } else {
                  modalTitle.textContent = 'Error!';
                  modalContent.classList.add('error');
              }
              modalOverlay.classList.add('show');

              setTimeout(() => {
                  modalOverlay.classList.remove('show');
              }, 3000);
          };

          modalCloseButton.addEventListener('click', () => {
              modalOverlay.classList.remove('show');
          });

          const fetchUserForms = async (userId) => {
              formsList.innerHTML = '';
              loadingMessage.classList.remove('hidden');
              errorMessage.classList.add('hidden');
              noFormsMessage.classList.add('hidden');

              if (!userId) {
                  loadingMessage.classList.add('hidden');
                  customModal('Please log in to view your forms.', 'error');
                  return;
              }

              try {
                  const response = await fetch(`${BASE_URL}/api/user-forms/${userId}`);
                  if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const data = await response.json();

                  loadingMessage.classList.add('hidden');

                  const sidebar = document.querySelector('.mainUl')

                  let initialSdb = sidebar.innerHTML
                  if(data.user.i_p){
                    let ip_div = ` <li href="/pro/analytics/?id=${data.user.id}">
                                 <i class="fas fa-gem"></i> Analytics
                              </li>`
                  sidebar.innerHTML = `${initialSdb}  <p></p>${ip_div}`
                  }
                  const name = data.user.name
                  if(name){
                    document.querySelector('.loggedIn').innerText = name
                  }
                  if (!data.forms || data.forms.length < 1 ){
                   noFormsMessage.classList.remove('hidden')
                   setTimeout(() => {
                   noFormsMessage.classList.remove('hidden')
                   }, 2000);
                  }
                    setUpListeners() 

                  if (data.forms && data.forms.length > 0) {
                      data.forms.forEach(form => {
                        const sidebarForms = document.querySelector('.forms')
                        let initial = sidebarForms.innerHTML;                            let newLi = ` <li class="none" href="/form/?id=${form.id}">
                                 <i class="fas fa-brush"></i> ${form.name}
                              </li>`
                          sidebarForms.innerHTML = `${initial}  <p></p>${newLi}`

                          
                          const formCard = document.createElement('div');
                          formCard.className = 'form-card p-4 border border-gray-200 rounded-lg shadow-sm bg-white transition-colors duration-300';
                          formCard.innerHTML = `
                              <h3 class="text-lg font-semibold text-blue-600 mb-2">${form.name || 'Untitled Form'}</h3>
                              <p class="text-sm text-gray-600 mb-2">ID: ${form.id}</p>
                              <p class="text-sm text-gray-600">Created: ${new Date(form.created_at).toLocaleDateString()}</p>
                              <div class="mt-4 flex flex-wrap gap-2">
                                  <a href="/form/?id=${form.id}&utm=dash_${data.user.id}" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors">
                                      <i class="fas fa-eye mr-1"></i> View
                                  </a>
                                  <a href="#" class="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors">
                                      <i class="fas fa-edit mr-1"></i> Edit
                                  </a>
                                  <a href="#delete/form/?id=${form.id}" onclick="deleteForm('${form.name}','${form.id}')" class="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors">
                                      <i class="fas fa-trash-alt mr-1"></i> Delete
                                  </a>
                                  <a href="#CopyLink/?id=${form.id}" class="copyLink inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors">
                                      <i class="fas fa-copy mr-1"></i> Copy Link
                                  </a>
                              </div>
                          `;
                          formsList.appendChild(formCard);
                          const copyBtn = formCard.querySelector('.copyLink')
                          copyBtn.addEventListener('click', ()=>{
                              var host = window.origin
                              link= `${host}/form/?id=${form.id}`
                              copyToClipboard(link)
                          })
                      });

                  } else {
                      noFormsMessage.classList.remove('hidden');
                  }
              } catch (error) {
                  console.error('Error fetching forms:', error);
                  loadingMessage.classList.add('hidden');
                  errorMessage.classList.remove('hidden');
                  customModal('Error fetching forms. Please try again.', 'error');
              }
          };

          logoutLink.addEventListener('click', (event) => {
              event.preventDefault();
              localStorage.removeItem('userToken');
              localStorage.removeItem('currentUserId');
              window.location.href = '/login';
          });

          const storedUserId = localStorage.getItem('id');
          if(!storedUserId){
              customModal('Please log in to view your forms.', 'error');
              setTimeout(() => {
                  window.location.href ='/login'
              }, 2000);
          }
          fetchUserForms(storedUserId);

          function copyToClipboard(text) {
          const tempInput = document.createElement('textarea');
          tempInput.value = text;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);

          customModal('Copied','success')
      }
    function setUpListeners(){
        console.log('setting listeners')
      const lis = document.querySelectorAll('li')
      lis.forEach(li=>{
        var link = li.getAttribute('href')
        if(link){
          li.addEventListener('click', ()=>{
            window.location.href = link
            if(li.classList.contains('toggle')){
              const forms = document.querySelector('.forms')
              const lis = forms.querySelectorAll('li')
              lis.forEach(li=>{
                console.log(li.classList)
                li.classList.add('flex')
                li.classList.remove('none')
              })

            }

          })
        }
      })
    }
    const sidebar = document.querySelector('.sidebar')
    const menu_icon = document.querySelector('.menu-icon')
    body.addEventListener('click', (e)=>{
      if(!sidebar.contains(e.target) && e.target != sidebar && e.target != menu_icon && !menu_icon.contains(e.target) && sidebar.classList.contains('visible')){
        sidebar.classList.remove('visible')
      }
    

            const darkModeToggle = document.getElementById('darkModeToggle');

      darkModeToggle.addEventListener('change', () => {
          if (darkModeToggle.checked) {
              enableDarkMode();
          } else {
              disableDarkMode();
          }
      });
      });
    })
      function deleteForm(name, id) {
        if(name && id){
           askConfirm(`Are You Sure you want to delete this form "${name || id }"`, `fetchDelete('${id}')`)
        } 
      }

      const fetchDelete = async (id) => {
        const u_id = localStorage.getItem('id')

        loading()
        const response = await fetch(`${BASE_URL}/api/delete_form/${id}/${u_id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        loading()
        toggleDO()
      if(data.error){
        customModal(data.error || 'An unknown error occured', error, 5000)
      }
      if(data.msg){
        customModal(data.msg, 'success')
        fetchUserForms(u_id)
      }
      }