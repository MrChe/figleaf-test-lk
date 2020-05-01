const debounce = (fn, wait = 1) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.call(this, ...args), wait)
  }
};

const delayPromise = (delay) => {
  return function(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, delay);
    });
  }
};

window.ImageGallery = (function () {

  class ImageGallery {
    /**
     * @constructor
     * @param {ImagesResolver} imagesResolver
     */
    constructor(imagesResolver) {
      this.imagesResolver = imagesResolver;
      this._initView();
      this._initViewFunctionality();
      this.cacheQuery = '';
    }

    /**
     * @param {String} query
     */
    search(query, searchModuleId) {
      if (query) {
        this.cacheQuery = query; // cached query to equal
        this.loaderContainer.classList.add('gallery__loader-container_state_show');
        this.loaderContainer.innerText = 'Loading...';
        this.imagesResolver.search(query, searchModuleId)
          .then(delayPromise(1000)) // TODO can remove this functionality if needed
          .then((res) => {
            if(res.images.length === 0 ) {
              this.loaderContainer.innerText = 'Data is Empty';
            } else {
              this.loaderContainer.innerText = '';
            }
            if (this.cacheQuery === query) {
              this._onReceiveSearchResult(res);
            }
          })
          .catch((error) => {
            console.error('ImageGallery search has error', error);
          })
      }
    }

    addToElement(element) {
      element.appendChild(this.container);
    }

    _onUserSearch(event) {
      event.preventDefault();
      this.search(this.seachInput.value, this.selectDb.value);
    }

    _onReceiveSearchResult(result) {
      this.searchResults.innerHTML = "";
      const imagesInfo = result.images;

      imagesInfo.forEach((image) => {
        const imgNode = document.createElement('img');
        imgNode.setAttribute('src', image.url);
        this.searchResults.appendChild(imgNode);
      });
    }

    _initView() {
      this.container = document.createElement("div");
      this.container.className = "gallery";

      this.form = document.createElement("form");
      this.form.className = "gallery__form form-inline";
      this.container.appendChild(this.form);

      this.formGroup = document.createElement("div");
      this.formGroup.className = "form-group";
      this.form.appendChild(this.formGroup);

      this.seachInput = document.createElement("input");
      this.seachInput.className = "gallery__search form-control";
      this.seachInput.placeholder = "search by tag";
      this.formGroup.appendChild(this.seachInput);

      this.loaderContainer = document.createElement("div");
      this.loaderContainer.className = 'gallery__loader-container';
      this.container.appendChild(this.loaderContainer);

      this.optionLocal = document.createElement('option');
      this.optionLocal.text = 'local';
      this.optionPixabay = document.createElement('option');
      this.optionPixabay.text = 'pixabay';

      this.selectDb = document.createElement('select');
      this.selectDb.className = "gallery__select form-control";
      this.selectDb.add(this.optionLocal);
      this.selectDb.add(this.optionPixabay);
      this.form.appendChild(this.selectDb);

      this.searchButton = document.createElement("button");
      this.searchButton.className = "gallery__button btn btn-primary";
      this.searchButton.innerText = "search";
      this.form.appendChild(this.searchButton);

      this.searchResults = document.createElement("div");
      this.searchResults.className = "gallery__result";
      this.container.appendChild(this.searchResults);
    }

    _initViewFunctionality() {
      this.form.addEventListener("submit", this._onUserSearch.bind(this));
      this.seachInput.addEventListener('keyup', debounce(this._onUserSearch.bind(this), 500));
    }
  }

  return ImageGallery;
})();
