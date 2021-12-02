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

function getCountry () {    
    const index = countrySelector.selectedIndex;
    const country = countrySelector[index].value;
    return country;
}

function getQuery () {    
  const searchStr = inputSearch.value;
  inputSearch.value = '';
  return searchStr;
}

function loadNews() {
  newsService.topHeadlines(country, onGetResponse);
}

function onGetResponse(err, res) {

  renderNews(res.articles);
  
  
}

function renderNews(news) {
//Del Spinner
  const newsContainer = document.querySelector('.news-container')

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    newsContainer.insertAdjacentHTML('afterbegin', el);
  });

}

function newsTemplate(news) {
  console.log(news);
  return `
    <div class="col-12 col-md-6 col-xl-4 my-2">
      <div class="card h-100">
        <img src="${news.urlToImage}" class="card-img-top"  style="height: 18rem; alt="News image">
        <div class="card-body">
          <h5 class="card-title">${news.title}</h5>
          <p class="card-text">${news.description}</p>
        </div>
        <div class="card-footer pt-3">
              <a href="${news.url}" class="btn btn-warning">Read more</a>
          </div>
      </div>
    </div>
  `;
}

//UI
const countrySelector = document.querySelector('.country-selector');
const btnSearch = document.querySelector('.btn-search');
const inputSearch = document.querySelector('.input-search');
const spinnerContainer = document.querySelector('.spiner-container');


//Variable
let country = getCountry();
let query = getQuery();

//Events
document.addEventListener('DOMContentLoaded', e => {
  //Add Spinner
  loadNews();
});
countrySelector.addEventListener('change', e => {
    country = getCountry();
});
btnSearch.addEventListener('click', e => {
  let query = getQuery();
});
inputSearch.addEventListener('keyup', e => {
  e.keyCode === 13 ? btnSearch.click() : null;
});


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