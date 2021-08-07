// Your JS code goes here

const table = document.querySelector('#table');
let resourcesList = [];
const lessonStatusKeywords = {
  "COMPLETE": {
    key: "Finished",
    class: 'finish'
  },
  "IN_PROGRESS": {
    key: "In Progress",
    class: 'progress'
  },
  "NOT_STARTED": {
    key: "Yet To Start",
    class: 'not-started'
  }
}

let fetchDataForRows = () => fetch('/api/book/maths').then(data => data.json());

const makeRows = resources => resources.map(resource => getRow(resource));

const getRow = resource => {
  let completeCountStatus;
  let completeCount;
  let rowStatus;

  if (!resource.completeCount) {
    completeCount = '0';
  } else {
    completeCount = resource.completeCount
  }


  if (resource.type === 'chapter') {
    completeCountStatus = `<progress class="complete-count-status" min="0" max=${resource.childrenCount} value=${completeCount}>${completeCount}</progress>`;

    lesson = ''
  } else {
    completeCountStatus = '';
    lesson = 'lesson'
  }

  if (resource.completeCount === resource.childrenCount) {
    rowStatus = "COMPLETE"
  } else if (resource.completeCount === 0) {
    rowStatus = "NOT_STARTED"
  } else if (resource.completeCount < resource.childrenCount) {
    rowStatus = "IN_PROGRESS"
  }

  return `
    <div class='resource-row'>
        <button onclick="toggleSections(this, ${resource.id})" class="row-button ${lesson}">
          <span class="type-position">
            <span class="type">${resource.type}</span>
            <span class="position">${resource.sequenceNO}</span>
          </span>
          <span class="resource-name">${resource.title}</span>
          <span class="status ${lessonStatusKeywords[rowStatus || resource.status].class}">${lessonStatusKeywords[rowStatus || resource.status].key}</span>
          ${completeCountStatus}
        </button>
        <div class="section-list-wrapper">
          <div class="sections-list" style="margin-top:-1000px"></div>
        </div>
    </div>
  `
}

const displayRows = () => {
  fetchDataForRows()
  .then(resp => {
      resourcesList = resp.response;
      table.innerHTML = makeRows(resp.response.sort((a, b) => a.sequenceNO - b.sequenceNO)).join('');
  })
  .catch(error => console.error(error));
}

displayRows();

const fetchSections = id => fetch(`/api/book/maths/section/${id}`).then(data => data.json());


const toggleSections = (rowButton, id) => {
  let resource = resourcesList.find(resource => resource.id === id && resource.type !== 'lesson');
  const sectionsList = rowButton.nextElementSibling.querySelector('.sections-list');

  if (resource) {
    if (resource.open) {
      resource.open = false;
      showOrHide(sectionsList, false);
      return;
    }

    if (resource.sections) {
      resource.open = true;

      showOrHide(sectionsList, true);
    } else {
      fetchSections(id)
      .then(resp => {
        resource.sections = true;
        sectionsList.innerHTML = makeSections(resp.response[id].sort((a, b) => a.sequenceNO - b.sequenceNO)).join('');
        sectionsList.style.marginTop = `-${sectionsList.offsetHeight}px`;
        
        showOrHide(sectionsList, true);
        rowButton.nextElementSibling.style.height = 'auto';
        resource.open = true;
      })
      .catch(error => console.error(error));
    }
  }
}

const showOrHide = (element, show) => {
  if (show) {
    element.style.marginTop = 0;
    // element.parentElement.parentElement.classList.('')
  } else {
    element.style.marginTop = `-${element.offsetHeight}px`;
    // element.parentElement.parentElement.classList.('')
  }
}

const makeSections = sections => sections.map(section => getSection(section));

const getSection = section => {
  let status = lessonStatusKeywords[section.status].key;

  return `
    <div class='section-row'>
      <span class="type-position">
        <span class="type">${section.type}</span>
        <span class="position">${section.sequenceNO}</span>
      </span>
      <span class="section-name">${section.title}</span>
      <span class="status ${lessonStatusKeywords[section.status].class}">${status}</span>
    </div>
  `
}
