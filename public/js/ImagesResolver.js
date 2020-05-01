const PIXABAY_URL = 'https://pixabay.com/api/';
const PIXABAY_KEY = '8522875-59a2673910903be627161f155&q=';
const PIXABAY_IMAGE_TYPE = 'all';
const PIXABAY_PER_PAGE = 100;

const mappingData = (data) => data.map((i) => ({
  id: i.id,
  url: i.previewURL,
  tags: i.tags
}));

window.ImagesResolver = (function () {
  class ImagesResolver {
    constructor() {
      this.state = {
        local: {},
        pixabay: {}
      };
    }


    localSearch(query) {
      if(query) {
        const localDb = window.localDB.filter((item) => {
          return item.tags.split(', ').indexOf(query) > -1;
        });

        const result =  {
          query: query,
          images: mappingData(localDb)
        };

        return Promise.resolve(result).then((res) => {
          this.state.local[query] = res;
          return this.state.local[query];
        })
          .catch((error) => {
            console.error('ImageResolver localSearch has error', error);
          })
      }
    }

    pixabaySearch(query) {
      if (query) {
        return fetch(`${PIXABAY_URL}?key=${PIXABAY_KEY}${query}&image_type=${PIXABAY_IMAGE_TYPE}&per_page=${PIXABAY_PER_PAGE}`)
          .then((res) => {
            return res.json();
          })
          .then((res) => {
            const data = res && res.hits;
            return {
              query: query,
              images: mappingData(data)
            }
          })
          .then((res) => {
            this.state.pixabay[query] = res;
            return this.state.pixabay[query];
          })
          .catch((error) => {
            console.error('ImageResolver pixabaySearch has error', error);
          })
      }
    }

    search(query, searchModuleId = 'local') {
      if(query && (searchModuleId in this.state)) {

        if (searchModuleId === 'local') {
          return this.localSearch(query)
        }

        if (searchModuleId === 'pixabay') {
          return this.pixabaySearch(query)
        }
      }
    }
  }

  return ImagesResolver;
})();
