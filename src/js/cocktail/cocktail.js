import Vue from 'vue';
import debounce from 'lodash.debounce';

const classesListUpdateDebounce = 50;

new Vue({
  el: '#cocktail',
  data: {
    dataLoaded: false,
    input: '',
    classes: null,
    filteredClasses: null,
  },
  computed: {
    numberOfFilteredClasses() {
      return this.filteredClasses.length;
    },
    inputIsNotEmpty() {
      return this.input !== '';
    },
    noResults() {
      return this.numberOfFilteredClasses === 0;
    },
    query() {
      const normalizedInput = this.input.trim().replace(/ +(?= )/g, '');
      return normalizedInput.split(' ');
    },
  },
  methods: {
    reset() {
      this.input = '';
      this.$refs.filter.focus();
    },
    filterClassesWithDebounce: debounce(function() {
      this.filterClasses();
    }, classesListUpdateDebounce),
    filterClasses() {
      this.filteredClasses = this.classes.filter(functionalClass =>
        this.query.every(query =>
          functionalClass.keywords.some(keyword => keyword.includes(query)),
        ),
      );
    },
    updateInput(e) {
      this.input = e.target.value;
    },
    setKeyword(keyword) {
      this.input = keyword;
      this.$refs.filter.focus();
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
