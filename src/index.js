import { category } from './js/category';
import { Requests } from './js/requests';
import { pagination } from './js/pagination';

import { setupNewsSection } from './js/section-categories-list';

import { requestsWeatherPosition, fetchWeather } from './js/weather';
import { concatNewsAndWeather, createMarkUp } from './js/markup';

import { clearNewsSection } from './js/clear-news-section';

const API_URL_NEWS = 'https://api.nytimes.com/svc';
const KEY_NEWS = '1XlCr4gRqRG4oQXZ0w6Bhmx7Lrq32aXd';

const refs = {
  btnSearch: document.querySelector('.search-button'),
  sectionNews: document.querySelector('.section-news'),
  noNewsPage: document.querySelector('.news-page'),
  noNewsPageTitle: document.querySelector('.news-page__title'),
};

export let weather = {};

let arraySearchArticleNews = [];
let arrayPopuralNews = [];
let arrayCardNews = [];
let arrayCardNewsFavorite = [];
let arrayCardNewsRead = [];

//створює обєкт для запитів
const requestsNews = new Requests(API_URL_NEWS, KEY_NEWS);

init();

//Робить запит на популярні новини та на погоду і верстає карточки
async function init() {
  setupNewsSection();
  await fetchWeather();
  await navigator.geolocation.getCurrentPosition(requestsWeatherPosition);
  await searchPopular();

  //відправка масиву відредагованого
  pagination(arrayPopuralNews);

  //arrayCardNews = function(arrayPopuralNews, погода)
}


//Функція для пошуку популярних новин
async function searchPopular() {
  try {
    await navigator.geolocation.getCurrentPosition(requestsWeatherPosition);
    const newsPopular = requestsNews.getRequests(
      requestsNews.createTrendingNewsQueryUrl()
    );
    await newsPopular.then(value => (arrayPopuralNews = value.results));
    console.log('Popular News: ', arrayPopuralNews);
    // ===Створення спільного масиву новин та погоди=======
    arrayCardNews = concatNewsAndWeather(
      arrayPopuralNews,
      arrayCardNewsFavorite,
      arrayCardNewsRead,
      weather
    );
    console.log('Concated arr popular:', arrayCardNews);
    // ===Розмітка новин і погоди============================
    const markup = createMarkUp(arrayCardNews);
    console.log(markup);
    //тимчасово видалить потом
    // console.log(arrayPopuralNews);
    //тимчасово видалить потом
    console.log(arrayPopuralNews);
  } catch (error) {
    console.log(error.message);
  }
}

searchPopular();

// Функція для пошуку за словом
async function searchArticle(searchValue) {
  try {
    const encodedSearchValue = encodeURIComponent(searchValue);
    const { response } = await requestsNews.getRequests(
      requestsNews.createSearchQueryUrl(encodedSearchValue)
    );
    arraySearchArticleNews = response.docs;
    console.log('Search news: ', arraySearchArticleNews);
    arrayCardNews = concatNewsAndWeather(
      arraySearchArticleNews,
      arrayCardNewsFavorite,
      arrayCardNewsRead,
      weather
    );
    console.log('Concated arr search:', arrayCardNews);
    const markup = createMarkUp(arrayCardNews);
    console.log(markup);
  } catch (error) {
    console.error(error);
  }
}

//Тимчасова функція для перевірки виводу новин по ключовому слову
refs.btnSearch.addEventListener('click', onClickSearchBtn);

function onClickSearchBtn(e) {
  searchArticle(encodeURIComponent('The New York Times'));
}

// показати сторінку поt found

function showPageNotFound(message) {
  refs.sectionNews.innerHTML = '';
  refs.noNewsPage.style.display = 'block';
  refs.noNewsPageTitle.textContent = message;
}

// сховати сторінку поt found
function hidePageNotFound() {
  refs.noNewsPage.style.display = 'none';
  refs.noNewsPageTitle = '';
}