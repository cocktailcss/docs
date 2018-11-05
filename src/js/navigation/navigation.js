import Vue from 'vue';
import debounce from 'lodash.debounce';

const classesListUpdateDebounce = 50;

new Vue({
  el: '#navigation',
  data: {
    dataLoaded: false,
    input: '',
    classes: null,
    filteredClasses: null,
  },
  computed: {
    numberOfClasses() {
      return this.filteredClasses.length;
    },
    inputIsEmpty() {
      return this.input === '';
    },
    noResults() {
      return this.numberOfClasses === 0;
    },
    query() {
      const normalizedInput = this.input.trim().replace(/ +(?= )/g, '');
      return normalizedInput.split(' ');
    },
  },
  methods: {
    filterClassesWithDebounce: debounce(function() {
      this.filterClasses();
    }, classesListUpdateDebounce),
    filterClasses() {
      this.filteredClasses = this.classes.filter(functionalClass => {
        return this.query.every(query => {
          return functionalClass.keywords.some(keyword => {
            return keyword.includes(query);
          });
        });
      });
    },
    updateInput(e) {
      this.input = e.target.value;
    },
    setKeyword(keyword) {
      this.input = keyword;
    },
    even: n => n % 2,
  },
  watch: {
    dataLoaded() {
      this.$nextTick(() => this.$refs.filter.focus());
    },
    input() {
      this.filterClasses();
    },
  },
  created() {
    fetch('data/classes.json')
      .then(res => res.json())
      .then(res => (this.classes = res))
      .catch(err => console.log(err))
      .finally(() => {
        this.filterClasses();
        this.dataLoaded = true;
      });
  },
});
