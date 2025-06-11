// Utility to normalize and compare technology names
const techAliases = {
    // Frontend Frameworks & Libraries
    'react': ['reactjs', 'react.js', 'react library', 'reactjs library', 'react native', 'reactjs native'],
    'angular': ['angularjs', 'angular.js', 'angular framework', 'angular 2+', 'angular2', 'angular4', 'angular5', 'angular6', 'angular7', 'angular8', 'angular9', 'angular10', 'angular11', 'angular12', 'angular13', 'angular14', 'angular15', 'angular16'],
    'vue': ['vuejs', 'vue.js', 'vue framework', 'vue 2', 'vue 3', 'vue2', 'vue3'],
    'svelte': ['sveltejs', 'svelte.js', 'svelte framework'],
    'next': ['nextjs', 'next.js', 'nextjs framework'],
    'nuxt': ['nuxtjs', 'nuxt.js', 'nuxtjs framework'],
    'gatsby': ['gatsbyjs', 'gatsby.js', 'gatsby framework'],
    'jquery': ['jquery.js', 'jquery library'],
    'bootstrap': ['bootstrap framework', 'bootstrap css', 'bootstrap 4', 'bootstrap 5'],
    'tailwind': ['tailwindcss', 'tailwind css', 'tailwind framework'],
    'material-ui': ['mui', 'material ui', 'material design'],
    'chakra': ['chakra ui', 'chakra-ui'],
    'styled-components': ['styled components', 'styledcomponents'],
    'redux': ['reduxjs', 'redux.js', 'redux toolkit'],
    'mobx': ['mobxjs', 'mobx.js'],
    'graphql': ['graphql.js', 'apollo graphql'],
    'apollo': ['apollo client', 'apollo server'],

    // Backend Frameworks & Technologies
    'node': ['nodejs', 'node.js', 'nodejs runtime', 'node runtime'],
    'express': ['expressjs', 'express.js', 'express framework'],
    'django': ['djangoframework', 'django framework', 'django python'],
    'flask': ['flaskframework', 'flask framework', 'flask python'],
    'fastapi': ['fast api', 'fastapi framework'],
    'spring': ['spring boot', 'spring framework', 'spring java'],
    'laravel': ['laravel php', 'laravel framework'],
    'rails': ['ruby on rails', 'ror', 'rails framework'],
    'asp': ['asp.net', 'aspnet', 'asp dotnet'],
    'dotnet': ['.net', 'dot net', 'dotnet core', '.net core'],
    'nest': ['nestjs', 'nest.js', 'nest framework'],
    'koa': ['koajs', 'koa.js', 'koa framework'],
    'hapi': ['hapijs', 'hapi.js', 'hapi framework'],
    'loopback': ['loopbackjs', 'loopback.js', 'loopback framework'],
    'adonis': ['adonisjs', 'adonis.js', 'adonis framework'],

    // Programming Languages
    'javascript': ['js', 'ecmascript', 'es6', 'es7', 'es8', 'es9', 'es10', 'es11', 'es12', 'es13'],
    'typescript': ['ts', 'typescript.js', 'tsx'],
    'python': ['py', 'python3', 'python 3', 'python2', 'python 2'],
    'java': ['java se', 'java ee', 'java me', 'j2ee', 'j2se'],
    'kotlin': ['kotlin android', 'kotlin jvm'],
    'swift': ['swift ios', 'swift apple'],
    'go': ['golang', 'go language'],
    'rust': ['rustlang', 'rust language'],
    'php': ['php7', 'php 7', 'php8', 'php 8'],
    'ruby': ['ruby language'],
    'scala': ['scala language'],
    'csharp': ['c#', 'c sharp', 'c#.net'],
    'cpp': ['c++', 'c plus plus'],
    'c': ['c language'],
    'r': ['r language', 'r programming'],
    'matlab': ['matlab programming'],
    'perl': ['perl language'],
    'haskell': ['haskell language'],
    'elixir': ['elixir language'],
    'erlang': ['erlang language'],
    'clojure': ['clojure language'],
    'fsharp': ['f#', 'f sharp'],

    // Databases
    'mongodb': ['mongo', 'mongodb database', 'mongo db'],
    'postgresql': ['postgres', 'postgresql database', 'postgres db', 'pgsql'],
    'mysql': ['mysql database', 'mysql db'],
    'oracle': ['oracle database', 'oracle db'],
    'sqlserver': ['mssql', 'sql server', 'microsoft sql server'],
    'sqlite': ['sqlite database', 'sqlite db'],
    'redis': ['redis database', 'redis db', 'redis cache'],
    'cassandra': ['apache cassandra', 'cassandra db'],
    'elasticsearch': ['elastic search', 'elastic', 'es'],
    'dynamodb': ['dynamo db', 'dynamo database'],
    'neo4j': ['neo4j database', 'neo4j db', 'neo4j graph'],
    'couchdb': ['couch db', 'couch database'],
    'firebase': ['firebase database', 'firebase db', 'firebase realtime'],
    'supabase': ['supabase database', 'supabase db'],

    // Cloud & DevOps
    'aws': ['amazon web services', 'amazon aws', 'aws cloud'],
    'azure': ['microsoft azure', 'azure cloud', 'azure devops'],
    'gcp': ['google cloud platform', 'google cloud', 'gcp cloud'],
    'heroku': ['heroku platform', 'heroku cloud'],
    'digitalocean': ['digital ocean', 'do cloud'],
    'docker': ['docker container', 'docker platform'],
    'kubernetes': ['k8s', 'kubernetes cluster', 'kube'],
    'terraform': ['terraform iac', 'terraform infrastructure'],
    'ansible': ['ansible automation', 'ansible configuration'],
    'jenkins': ['jenkins ci', 'jenkins cd', 'jenkins pipeline'],
    'gitlab': ['gitlab ci', 'gitlab cd', 'gitlab pipeline'],
    'github': ['github actions', 'github ci', 'github cd'],
    'circleci': ['circle ci', 'circle continuous integration'],
    'travis': ['travis ci', 'travis continuous integration'],
    'prometheus': ['prometheus monitoring', 'prometheus metrics'],
    'grafana': ['grafana monitoring', 'grafana dashboard'],
    'elk': ['elasticsearch logstash kibana', 'elastic stack'],
    'splunk': ['splunk monitoring', 'splunk analytics'],

    // Mobile Development
    'android': ['android development', 'android studio'],
    'ios': ['ios development', 'ios app', 'apple ios'],
    'flutter': ['flutter framework', 'flutter mobile'],
    'reactnative': ['react native', 'reactnative mobile'],
    'xamarin': ['xamarin forms', 'xamarin mobile'],
    'ionic': ['ionic framework', 'ionic mobile'],
    'cordova': ['apache cordova', 'cordova mobile'],
    'swiftui': ['swift ui', 'swiftui framework'],
    'kotlin': ['kotlin android', 'kotlin mobile'],

    // AI & Machine Learning
    'tensorflow': ['tensor flow', 'tensorflow ml'],
    'pytorch': ['py torch', 'pytorch ml'],
    'keras': ['keras ml', 'keras deep learning'],
    'scikit': ['scikit learn', 'scikit-learn', 'sklearn'],
    'opencv': ['open cv', 'opencv computer vision'],
    'numpy': ['numpy python', 'numpy array'],
    'pandas': ['pandas python', 'pandas dataframe'],
    'matplotlib': ['matplotlib python', 'matplotlib plotting'],
    'seaborn': ['seaborn python', 'seaborn visualization'],
    'spark': ['apache spark', 'spark ml'],
    'hadoop': ['apache hadoop', 'hadoop big data'],
    'kafka': ['apache kafka', 'kafka streaming'],

    // Testing & Quality
    'jest': ['jest testing', 'jest js'],
    'mocha': ['mocha testing', 'mocha js'],
    'cypress': ['cypress testing', 'cypress e2e'],
    'selenium': ['selenium testing', 'selenium webdriver'],
    'junit': ['junit testing', 'junit java'],
    'pytest': ['pytest testing', 'pytest python'],
    'sonarqube': ['sonar qube', 'sonar quality'],
    'eslint': ['es lint', 'eslint js'],
    'prettier': ['prettier formatting', 'prettier code'],
    'typescript': ['ts', 'typescript.js', 'tsx'],

    // Security
    'owasp': ['owasp security', 'owasp top 10'],
    'jwt': ['json web token', 'jwt authentication'],
    'oauth': ['oauth2', 'oauth authentication'],
    'ssl': ['ssl certificate', 'ssl tls'],
    'tls': ['transport layer security', 'tls certificate'],
    'cors': ['cross origin resource sharing', 'cors policy'],
    'xss': ['cross site scripting', 'xss attack'],
    'csrf': ['cross site request forgery', 'csrf attack'],
    'sql-injection': ['sql injection', 'sql injection attack'],
    'penetration-testing': ['pen testing', 'penetration test'],

    // Business & Management
    'project-management': ['project management', 'pm', 'project manager', 'agile', 'scrum', 'kanban', 'waterfall'],
    'product-management': ['product management', 'product manager', 'product owner', 'po'],
    'business-analysis': ['business analysis', 'business analyst', 'ba', 'requirements analysis'],
    'digital-marketing': ['digital marketing', 'seo', 'sem', 'social media marketing', 'content marketing', 'email marketing'],
    'data-analysis': ['data analysis', 'business intelligence', 'bi', 'data analytics', 'data visualization'],
    'finance': ['financial analysis', 'financial management', 'accounting', 'bookkeeping', 'taxation'],
    'hr': ['human resources', 'hr management', 'recruitment', 'talent acquisition', 'employee relations'],
    'sales': ['sales management', 'business development', 'account management', 'customer success'],
    'operations': ['operations management', 'supply chain', 'logistics', 'procurement'],
    'strategy': ['business strategy', 'corporate strategy', 'strategic planning', 'business planning'],

    // Design & Creative
    'ui-design': ['ui design', 'user interface design', 'interface design', 'ui/ux'],
    'ux-design': ['ux design', 'user experience design', 'experience design', 'ui/ux'],
    'graphic-design': ['graphic design', 'visual design', 'brand design', 'print design'],
    'motion-design': ['motion design', 'animation', 'motion graphics', 'after effects'],
    '3d-design': ['3d design', '3d modeling', '3d animation', 'blender', 'maya', '3ds max'],
    'illustration': ['digital illustration', 'vector illustration', 'character design', 'concept art'],
    'photography': ['digital photography', 'photo editing', 'photo retouching', 'lightroom', 'photoshop'],
    'video-production': ['video production', 'video editing', 'motion graphics', 'premiere pro'],
    'game-design': ['game design', 'game development', 'game art', 'game mechanics'],
    'industrial-design': ['industrial design', 'product design', 'industrial engineering'],

    // Content & Media
    'content-writing': ['content writing', 'copywriting', 'technical writing', 'content creation'],
    'social-media': ['social media management', 'social media marketing', 'community management'],
    'video-editing': ['video editing', 'video post-production', 'video effects', 'color grading'],
    'audio-production': ['audio production', 'sound design', 'music production', 'podcast production'],
    'journalism': ['digital journalism', 'news writing', 'editorial', 'reporting'],
    'translation': ['translation services', 'localization', 'language translation', 'interpretation'],

    // Education & Training
    'teaching': ['teaching', 'education', 'instructional design', 'curriculum development'],
    'training': ['corporate training', 'professional development', 'workshop facilitation'],
    'e-learning': ['e-learning', 'online education', 'distance learning', 'educational technology'],
    'coaching': ['life coaching', 'business coaching', 'career coaching', 'executive coaching'],
    'mentoring': ['mentoring', 'mentorship', 'professional mentoring', 'career guidance'],

    // Healthcare & Wellness
    'healthcare': ['healthcare management', 'healthcare technology', 'medical administration'],
    'fitness': ['fitness training', 'personal training', 'sports coaching', 'wellness coaching'],
    'nutrition': ['nutrition consulting', 'dietetics', 'nutritional science', 'diet planning'],
    'mental-health': ['mental health', 'counseling', 'psychology', 'therapy'],
    'yoga': ['yoga instruction', 'yoga therapy', 'meditation', 'mindfulness'],

    // Legal & Compliance
    'legal': ['legal services', 'law practice', 'legal consulting', 'paralegal'],
    'compliance': ['regulatory compliance', 'risk management', 'governance', 'legal compliance'],
    'contract-law': ['contract law', 'contract management', 'legal documentation'],
    'intellectual-property': ['intellectual property', 'patent law', 'trademark law', 'copyright law'],

    // Research & Science
    'research': ['scientific research', 'academic research', 'market research', 'data research'],
    'laboratory': ['laboratory science', 'lab research', 'scientific analysis', 'experimental research'],
    'biotechnology': ['biotechnology', 'biotech research', 'genetic engineering', 'biomedical research'],
    'environmental-science': ['environmental science', 'sustainability', 'climate science', 'conservation'],

    // Architecture & Construction
    'architecture': ['architectural design', 'building design', 'architectural planning'],
    'interior-design': ['interior design', 'space planning', 'interior architecture'],
    'construction': ['construction management', 'building construction', 'project supervision'],
    'urban-planning': ['urban planning', 'city planning', 'urban design', 'landscape architecture'],

    // Agriculture & Food
    'agriculture': ['agricultural science', 'farming', 'agribusiness', 'sustainable agriculture'],
    'food-science': ['food science', 'food technology', 'food safety', 'nutrition science'],
    'culinary-arts': ['culinary arts', 'professional cooking', 'food preparation', 'chef training'],

    // Arts & Entertainment
    'music': ['music production', 'music performance', 'music composition', 'audio engineering'],
    'theater': ['theater arts', 'performing arts', 'stage production', 'dramatic arts'],
    'fine-arts': ['fine arts', 'visual arts', 'artistic creation', 'artistic expression'],
    'fashion': ['fashion design', 'fashion technology', 'textile design', 'fashion merchandising'],

    // Social Services
    'social-work': ['social work', 'community services', 'social services', 'human services', 'social work', 'social services', 'human services'],
    'nonprofit': ['nonprofit management', 'charity work', 'philanthropy', 'social impact', 'ngo', 'non-profit'],
    'counseling': ['counseling services', 'mental health counseling', 'family counseling', 'career counseling'],

    // Transportation & Logistics
    'logistics': ['logistics management', 'supply chain management', 'transportation management'],
    'aviation': ['aviation management', 'airline operations', 'airport management', 'flight operations'],
    'maritime': ['maritime operations', 'shipping management', 'port operations', 'marine logistics'],

    // Energy & Utilities
    'renewable-energy': ['renewable energy', 'sustainable energy', 'solar energy', 'wind energy'],
    'energy-management': ['energy management', 'power systems', 'energy efficiency', 'utility management'],
    'environmental-engineering': ['environmental engineering', 'water resources', 'waste management', 'pollution control']
};

// Function to normalize technology name
const normalizeTechName = (tech) => {
    if (!tech) return '';
    
    // Convert to lowercase and remove special characters
    const normalized = tech.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    // Check if the normalized name matches any known aliases
    for (const [mainTech, aliases] of Object.entries(techAliases)) {
        if (normalized === mainTech || aliases.includes(normalized)) {
            return mainTech;
        }
    }
    
    return normalized;
};

// Function to check if two technologies are similar
const areTechnologiesSimilar = (tech1, tech2) => {
    const normalized1 = normalizeTechName(tech1);
    const normalized2 = normalizeTechName(tech2);
    
    // Exact match after normalization
    if (normalized1 === normalized2) return true;
    
    // Check if one is an alias of the other
    for (const [mainTech, aliases] of Object.entries(techAliases)) {
        if ((normalized1 === mainTech && aliases.includes(normalized2)) ||
            (normalized2 === mainTech && aliases.includes(normalized1))) {
            return true;
        }
    }
    
    // Check for partial matches (e.g., "react" in "react native")
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        return true;
    }
    
    return false;
};

export { normalizeTechName, areTechnologiesSimilar }; 