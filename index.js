(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const dataPanel = document.getElementById('data-panel')
  let data = []
  // search
  const searchBtn = document.getElementById('submit-search')
  const searchInput = document.getElementById('search')
  // pagination
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  // show mode
  let showMode = 'card'
  let currentPage = 1

  axios.get(INDEX_URL)
    .then((response) => {
      console.log(...response.data.results)
      data.push(...response.data.results)
      getTotalPages(data)
      getPageData(1, data)
    })
    .catch((err) => (console.log(err)))

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
      currentPage = Number(event.target.dataset.page)
    }
  })

  function getPageData(pageNum, inputData) {
    let paginationData = inputData || data
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

  // listen to search btn click event
  searchBtn.addEventListener('click', event => {
    let results = []
    event.preventDefault()
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    getTotalPages(results)
    getPageData(1, results)
    currentPage = 1
  })

  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  function displayDataList(data) {
    let htmlContent = ''
    // 判斷 show mode
    if (showMode === 'card') {
      data.forEach(element => {
        htmlContent += `
        <div class="col-sm-3">
          <div class="card">
            <img class="card-img-top" src="${POSTER_URL}${element.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${element.title}</h6>
            </div>

            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${element.id}">More</button>
              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${element.id}">+</button>
            </div>
          </div>
        </div>
      `
      })
    } else if (showMode === 'list') {
      data.forEach(element => {
        htmlContent += `
            <div style="width: 100%; height: auto; border-top: 1px solid #c4c4c4; padding: 0.4em 0em">
              ${element.title}
              <!-- "More" button -->
              <div class="float-right">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${element.id}">More</button>
                <!-- favorite button -->
                <button class="btn btn-info btn-add-favorite" data-id="${element.id}">+</button>
              </div>
            </div>    
        `
      })
    }

    dataPanel.innerHTML = htmlContent
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  // mode switch
  const listMode = document.querySelector('.fa-bars')
  const cardMode = document.querySelector('.fa-th')
  listMode.addEventListener('click', () => {
    showMode = 'list'
    console.log('listMode')
    getPageData(currentPage)
  })
  cardMode.addEventListener('click', () => {
    showMode = 'card'
    console.log('cardMode')
    getPageData(currentPage)
  })
})()