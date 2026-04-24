const fs = require('fs');

const oldHtml = fs.readFileSync('old_index.html', 'utf8');
const currHtml = fs.readFileSync('frontend/index.html', 'utf8');

const dbStart = currHtml.indexOf('<div class="app-layout">');
const dbEnd = currHtml.indexOf('</section> <!-- End tab-database -->');
let dbContent = currHtml.substring(dbStart, dbEnd);

let newHtml = oldHtml.replace('<li><a href="#governments" class="navbar__link">Governments</a></li>', 
  '<li><a href="#database" class="navbar__link">Database</a></li>\n        <li><a href="#governments" class="navbar__link">Governments</a></li>');

dbContent = '<section class="section" id="database" style="display:none;">\n' + dbContent + '\n</section>\n';

newHtml = newHtml.replace('  </main>', dbContent + '  </main>');

newHtml = newHtml.replace('<script src="script.js"></script>', 
  '<script src="js/dashboard.js"></script>\n<script src="js/api.js"></script>\n<script src="js/visualizations.js"></script>\n<script src="js/main.js"></script>\n<script src="js/chapters/aggregate.js"></script>\n<script src="js/chapters/subqueries.js"></script>\n<script src="js/chapters/joins.js"></script>\n<script src="js/chapters/set_operations.js"></script>\n<script src="js/chapters/views.js"></script>\n<script src="js/chapters/functions.js"></script>\n<script src="js/chapters/procedures.js"></script>\n<script src="js/chapters/triggers.js"></script>\n<script src="js/chapters/cursors.js"></script>\n<script src="js/chapters/normalization.js"></script>\n<script src="js/chapters/concurrency.js"></script>');

// Also move the ChartJS script to head or keep in the head where it is currently?
// Actually old_index.html didn't have chart.js in head, let's insert it
newHtml = newHtml.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>\n</head>');

fs.writeFileSync('frontend/index.html', newHtml);
console.log('Successfully rebuilt index.html');
