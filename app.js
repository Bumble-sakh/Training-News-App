const http = customHttp();

const newsService = (function() {
  const apiKey = '5c2b80530ab74210ae5ab70922bb63a4';
  const apiUrl = 'https://newsapi.org/v2/';

  return {
    topHeadlines(country = 'ru', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  }
})();

//UI
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const spinnerContainer = document.querySelector('.spinner-container');
const newsContainer = document.querySelector('.news-container');
const toastContainer = document.querySelector('.toast-container');

//Events
document.addEventListener('DOMContentLoaded', e => {
  loadNews();
});

countrySelect.addEventListener('change', e => {
    country = countrySelect.value;
    loadNews();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  countrySelect.value = '';
  loadNews();
});

function customHttp() {
    return {
      get(url, cb) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          xhr.send();
      
          xhr.addEventListener('load', () => {
            if(Math.floor(xhr.status / 100) !== 2) {
              cb(`Error. Status code: ${xhr.status}`, xhr);
              return ;
            }
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          });
      
          xhr.addEventListener('error', () => {
            cb(`Error. Status code: ${xhr.status}`, xhr);
          });
        } catch (error) {
          cb(`Error. ${error}`);
        }  
      },
      post(url, body, headers, cb) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          
          // for (const header in headers) {
          //   xhr.setRequestHeader(header, headers[header]);
          // }
  
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          })  
          
          xhr.send(JSON.stringify(body));
      
          xhr.addEventListener('load', () => {
            if(Math.floor(xhr.status / 100) !== 2) {
              cb(`Error. Status code: ${xhr.status}`, xhr);
              return ;
            }
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          });
      
          xhr.addEventListener('error', () => {
            cb(`Error. Status code: ${xhr.status}`, xhr);
          });
        } catch (error) {
          cb(`Error. ${error}`);
        }  
      },
    }
  }

function loadNews() {
  const country = countrySelect.value;
  const query = searchInput.value;
  searchInput.value = '';

  addSpinner();  
  
  if(!query) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(query, onGetResponse);
  }
}

function onGetResponse(err, res) { 
  delSpinner();
  
  if(err) {
    showMessage(err, 'bg-danger');
    return;
  }
  if(!res.articles.length) {
    const msg = 'No news on the selected topic';
    showMessage(msg, 'bg-warning');
    return;
  }

  renderNews(res.articles);
}

function renderNews(news) {
  clearNewsContainer();

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    newsContainer.insertAdjacentHTML('afterbegin', el);
  });
}

function addSpinner() {
  spinnerContainer.classList.remove('d-none');
}

function delSpinner() {
  spinnerContainer.classList.add('d-none');
}

function clearNewsContainer() {

  while (newsContainer.children.length) {
    newsContainer.removeChild(newsContainer.firstChild)
  }

}

function showMessage(msg, type = 'bg-primary') {
  const toastId = `f${(+new Date).toString(16)}`;
  const element = toastTemplate(toastId, msg, type);
  toastContainer.insertAdjacentHTML('afterbegin', element);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

function newsTemplate({ urlToImage, title, description, url}) {
  return `
    <div class="col-12 col-md-6 col-xl-4 my-2">
      <div class="card h-100">
        <img src="${urlToImage}" class="card-img-top"  style="height: 18rem; alt="News image">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <p class="card-text">${description}</p>
        </div>
        <div class="card-footer pt-3">
              <a href="${url}" class="btn btn-warning">Read more</a>
          </div>
      </div>
    </div>
  `;
}

function toastTemplate(id, msg, type) {
  return `
    <div class="toast ${type} align-items-center text-white border-0" id="${id}" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${msg}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
}