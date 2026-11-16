const INITIAL_DISHES = [
  // ANTIPASTI
  { id: 'ant-1', name: 'Bruschette al pomodoro fresco e basilico', category: 'antipasto', group: 'cereali', time: '10 min', tags: ['Veloce', 'Estivo'], notes: 'Con olio EVO a crudo' },
  { id: 'ant-2', name: 'Pinzimonio di verdure croccanti con hummus', category: 'antipasto', group: 'legumi', time: '15 min', tags: ['Sano', 'Veloce'], notes: 'Carote, sedano, finocchi e hummus di ceci' },
  { id: 'ant-3', name: 'Caprese con mozzarella e origano', category: 'antipasto', group: 'latticini', time: '5 min', tags: ['Senza cottura', 'Veloce'], notes: 'Pomodori cuore di bue e mozzarella fior di latte' },
  { id: 'ant-4', name: 'Crostini con crema di olive e pomodori secchi', category: 'antipasto', group: 'cereali', time: '10 min', tags: ['Sfizioso'], notes: 'Pane integrale tostato' },
  { id: 'ant-5', name: 'Insalata di mare tiepida', category: 'antipasto', group: 'pesce', time: '30 min', tags: ['Domenica'], notes: 'Polpo, seppie, gamberi, limone e prezzemolo' },
  { id: 'ant-6', name: 'Bresaola rucola e scaglie di Parmigiano', category: 'antipasto', group: 'carne_rossa', time: '5 min', tags: ['Proteico', 'Veloce'], notes: 'Condita con limone e olio EVO' },
  { id: 'ant-7', name: 'Involtini di melanzane grigliate e ricotta', category: 'antipasto', group: 'latticini', time: '20 min', tags: ['Vegetariano'], notes: 'Ricotta vaccina, basilico e pinoli' },

  // PRIMI
  { id: 'pri-1', name: 'Spaghetti integrali al pomodoro e basilico', category: 'primo', group: 'cereali', time: '15 min', tags: ['Classico', 'Bambini'], notes: 'Passata rustica e olio EVO a crudo' },
  { id: 'pri-2', name: 'Pasta e ceci rosmarino e olio EVO', category: 'primo', group: 'legumi', time: '25 min', tags: ['Piatto Unico', 'Comfort'], notes: 'Ditalini rigati o misto pasta con ceci cremosi' },
  { id: 'pri-3', name: 'Pasta e lenticchie della tradizione', category: 'primo', group: 'legumi', time: '30 min', tags: ['Piatto Unico', 'Invernale'], notes: 'Con soffritto leggero di sedano, carota e cipolla' },
  { id: 'pri-4', name: 'Risotto allo zafferano e zucchine', category: 'primo', group: 'cereali', time: '25 min', tags: ['Delicato', 'Bambini'], notes: 'Mantecato leggero con Parmigiano' },
  { id: 'pri-5', name: 'Orecchiette con le cime di rapa', category: 'primo', group: 'cereali', time: '20 min', tags: ['Tradizione'], notes: 'Con aglio, olio e un filetto di alici' },
  { id: 'pri-6', name: 'Trofie al pesto genovese con fagiolini e patate', category: 'primo', group: 'cereali', time: '20 min', tags: ['Famiglia'], notes: 'Pesto di basilico fresco e pinoli' },
  { id: 'pri-7', name: 'Insalata di farro con pomodorini, olive e feta', category: 'primo', group: 'cereali', time: '20 min', tags: ['Da portare', 'Fresco'], notes: 'Ottima anche preparata la sera prima' },
  { id: 'pri-8', name: 'Spaghetti alle vongole veraci', category: 'primo', group: 'pesce', time: '25 min', tags: ['Weekend', 'Pesce'], notes: 'Prezzemolo fresco e aglio in camicia' },
  { id: 'pri-9', name: 'Penne all\'arrabbiata o al tonno e olive', category: 'primo', group: 'pesce', time: '15 min', tags: ['Veloce', 'Salva-pranzo'], notes: 'Tonno in vetro all\'olio d\'oliva e capperi' },
  { id: 'pri-10', name: 'Vellutata di zucca e carote con crostini integrali', category: 'primo', group: 'verdura', time: '30 min', tags: ['Leggero', 'Cena'], notes: 'Con semi di zucca tostati e filo d\'olio' },
  { id: 'pri-11', name: 'Minestrone di verdure di stagione con orzo', category: 'primo', group: 'cereali', time: '40 min', tags: ['Detox', 'Sano'], notes: 'Ricco di fibre e verdure fresche' },
  { id: 'pri-12', name: 'Gnocchi di patate al ragù leggero o pomodoro', category: 'primo', group: 'cereali', time: '15 min', tags: ['Giovedì', 'Bambini'], notes: 'Con spolverata di parmigiano' },
  { id: 'pri-13', name: 'Cous cous mediterraneo con verdure e ceci', category: 'primo', group: 'legumi', time: '20 min', tags: ['Piatto Unico', 'Veloce'], notes: 'Zucchine, peperoni, carote e ceci' },
  { id: 'pri-14', name: 'Lasagna o Pasta al forno della Domenica', category: 'primo', group: 'carne_rossa', time: '60 min', tags: ['Domenica', 'Festa'], notes: 'Piatto speciale del fine settimana' },

  // SECONDI - PESCE
  { id: 'sec-1', name: 'Filetto di salmone al forno con erbe aromatiche', category: 'secondo', group: 'pesce', time: '20 min', tags: ['Omega-3', 'Veloce'], notes: 'Cotto al cartoccio con limone e aneto' },
  { id: 'sec-2', name: 'Orata o Branzino al cartoccio con pomodorini e olive', category: 'secondo', group: 'pesce', time: '30 min', tags: ['Leggero', 'Cena'], notes: 'Con olive taggiasche e origano' },
  { id: 'sec-3', name: 'Filetti di merluzzo alla pizzaiola in padella', category: 'secondo', group: 'pesce', time: '20 min', tags: ['Bambini', 'Veloce'], notes: 'Con salsa di pomodoro, capperi e origano' },
  { id: 'sec-4', name: 'Alici o Sarde gratinate al forno con panure aromatica', category: 'secondo', group: 'pesce', time: '25 min', tags: ['Pesce Azzurro', 'Economico'], notes: 'Pangrattato integrale, prezzemolo e scorza di limone' },
  { id: 'sec-5', name: 'Seppie in umido con piselli', category: 'secondo', group: 'pesce', time: '35 min', tags: ['Completo'], notes: 'Secondo piatto ricco e tenerissimo' },
  { id: 'sec-6', name: 'Tranci di pesce spada alla griglia con salmoriglio', category: 'secondo', group: 'pesce', time: '15 min', tags: ['Veloce'], notes: 'Olio, limone, origano e prezzemolo' },

  // SECONDI - CARNE BIANCA
  { id: 'sec-7', name: 'Petto di pollo alla piastra con limone e rosmarino', category: 'secondo', group: 'carne_bianca', time: '15 min', tags: ['Proteico', 'Veloce'], notes: 'Marinato per renderlo morbido' },
  { id: 'sec-8', name: 'Straccetti di tacchino con rucola e pomodorini', category: 'secondo', group: 'carne_bianca', time: '15 min', tags: ['Veloce', 'Leggero'], notes: 'Saltati in padella in 10 minuti' },
  { id: 'sec-9', name: 'Pollo al forno con patate e rosmarino', category: 'secondo', group: 'carne_bianca', time: '50 min', tags: ['Famiglia', 'Classico'], notes: 'Cosce o sovracosce dorate al forno' },
  { id: 'sec-10', name: 'Polpette di pollo e ricotta al sugo o al forno', category: 'secondo', group: 'carne_bianca', time: '25 min', tags: ['Bambini', 'Morbide'], notes: 'Senza frittura, leggerissime' },

  // SECONDI - LEGUMI
  { id: 'sec-11', name: 'Burger di ceci e verdure fatti in casa', category: 'secondo', group: 'legumi', time: '25 min', tags: ['Vegetariano', 'Bambini'], notes: 'Cotti in padella antiaderente o forno' },
  { id: 'sec-12', name: 'Fagioli all\'uccelletta con salvia e pomodoro', category: 'secondo', group: 'legumi', time: '20 min', tags: ['Tradizione', 'Proteine Vegetali'], notes: 'Ottimi con una fetta di pane tostato' },
  { id: 'sec-13', name: 'Polpette di lenticchie al forno con salsa yogurt', category: 'secondo', group: 'legumi', time: '30 min', tags: ['Sfizioso', 'Sano'], notes: 'Croccanti fuori e morbide dentro' },
  { id: 'sec-14', name: 'Farinata di ceci al rosmarino', category: 'secondo', group: 'legumi', time: '35 min', tags: ['Senza Glutine', 'Tradizione'], notes: 'Sottile e dorata in teglia' },

  // SECONDI - UOVA
  { id: 'sec-15', name: 'Frittata al forno con zucchine e menta', category: 'secondo', group: 'uova', time: '25 min', tags: ['Salva-cena', 'Bambini'], notes: 'Senza frittura, soffice e digeribile' },
  { id: 'sec-16', name: 'Uova in purgatorio (al sugo di pomodoro e basilico)', category: 'secondo', group: 'uova', time: '15 min', tags: ['Veloce', 'Comfort'], notes: 'Da accompagnare con pane integrale' },
  { id: 'sec-17', name: 'Omelette con spinaci e ricotta', category: 'secondo', group: 'uova', time: '15 min', tags: ['Veloce', 'Cena'], notes: 'Morbida e nutriente' },

  // SECONDI - LATTICINI
  { id: 'sec-18', name: 'Ricotta fresca vaccina con pomodorini e origano', category: 'secondo', group: 'latticini', time: '5 min', tags: ['Senza cottura', 'Leggero'], notes: 'Latticino magro ideale per la cena' },
  { id: 'sec-19', name: 'Primo sale o Caciotta fresca alla piastra con verdure', category: 'secondo', group: 'latticini', time: '10 min', tags: ['Veloce'], notes: 'Con filo d\'olio e origano' },
  { id: 'sec-20', name: 'Mozzarella o Stracciatella con verdure grigliate', category: 'secondo', group: 'latticini', time: '10 min', tags: ['Fresco'], notes: 'Da consumare 1-2 volte a settimana' },

  // SECONDI - CARNE ROSSA
  { id: 'sec-21', name: 'Tagliata di manzo con rucola e scaglie di Grana', category: 'secondo', group: 'carne_rossa', time: '15 min', tags: ['Max 1/sett'], notes: 'Cottura rapida sulla piastra rovente' },
  { id: 'sec-22', name: 'Polpette di manzo magro al sugo di pomodoro', category: 'secondo', group: 'carne_rossa', time: '30 min', tags: ['Famiglia'], notes: 'Ricetta classica della nonna' },

  // CONTORNI
  { id: 'con-1', name: 'Insalata mista di stagione (lattuga, radicchio, carote, finocchi)', category: 'contorno', group: 'verdura', time: '10 min', tags: ['Quotidiano', 'Crudo'], notes: 'Con semi misti e olio EVO' },
  { id: 'con-2', name: 'Verdure miste grigliate (zucchine, melanzane, peperoni)', category: 'contorno', group: 'verdura', time: '20 min', tags: ['Leggero'], notes: 'Condite con prezzemolo, aglio e olio a crudo' },
  { id: 'con-3', name: 'Broccoli o Cavolfiore al vapore con olio e limone', category: 'contorno', group: 'verdura', time: '15 min', tags: ['Antiossidante'], notes: 'O ripassati in padella con aglio e peperoncino' },
  { id: 'con-4', name: 'Spinaci o Bietole saltate al limone', category: 'contorno', group: 'verdura', time: '15 min', tags: ['Ferro', 'Veloce'], notes: 'Cotti al vapore in pochi minuti' },
  { id: 'con-5', name: 'Finocchi gratinati leggerissimi al forno', category: 'contorno', group: 'verdura', time: '25 min', tags: ['Bambini', 'Saporito'], notes: 'Con pangrattato, erbe e poco parmigiano' },
  { id: 'con-6', name: 'Fagiolini lessi con patate al prezzemolo', category: 'contorno', group: 'verdura', time: '20 min', tags: ['Classico'], notes: 'Ottimi sia tiepidi che freddi' },
  { id: 'con-7', name: 'Patate al forno croccanti al rosmarino', category: 'contorno', group: 'cereali', time: '40 min', tags: ['Famiglia'], notes: 'Tagliate a spicchi con la buccia' },
  { id: 'con-8', name: 'Peperonata leggera o Caponata di verdure in padella', category: 'contorno', group: 'verdura', time: '30 min', tags: ['Gusto'], notes: 'Cotta dolcemente con coperchio' },
  { id: 'con-9', name: 'Carote julienne e finocchi al limone', category: 'contorno', group: 'verdura', time: '10 min', tags: ['Veloce', 'Digestivo'], notes: 'Freschissimo e croccante' },

  // FRUTTA
  { id: 'fru-1', name: 'Mela croccante (Fuji, Pink Lady o Golden)', category: 'frutta', group: 'frutta', time: '2 min', tags: ['Tutto l\'anno'], notes: '1 porzione di frutta fresca' },
  { id: 'fru-2', name: 'Arance o Mandarini freschi', category: 'frutta', group: 'frutta', time: '3 min', tags: ['Vitamina C'], notes: 'Agrumi di stagione' },
  { id: 'fru-3', name: 'Pere con 3 noci (Omega-3)', category: 'frutta', group: 'frutta', time: '3 min', tags: ['Energia', 'Sazietà'], notes: 'Frutta fresca + frutta a guscio' },
  { id: 'fru-4', name: 'Kiwi e Banana', category: 'frutta', group: 'frutta', time: '3 min', tags: ['Potassio', 'Vitamina C'], notes: 'Ottimo fine pasto o spuntino' },
  { id: 'fru-5', name: 'Frutti di bosco (Mirtilli, Lamponi, Fragole) al naturale', category: 'frutta', group: 'frutta', time: '5 min', tags: ['Antiossidanti'], notes: 'Con succo di limone' },
  { id: 'fru-6', name: 'Macedonia di frutta fresca di stagione al limone', category: 'frutta', group: 'frutta', time: '10 min', tags: ['Famiglia'], notes: 'Senza zuccheri aggiunti' },
  { id: 'fru-7', name: 'Pesche, Albicocche o Susine', category: 'frutta', group: 'frutta', time: '3 min', tags: ['Estivo'], notes: 'Frutta fresca estiva' },
  { id: 'fru-8', name: 'Uva fresca o Melograno', category: 'frutta', group: 'frutta', time: '5 min', tags: ['Autunnale'], notes: 'Ricca di polifenoli' }
];

const MEDITERRANEAN_TARGETS = [
  { id: 'pesce', label: 'Pesce', icon: '🐟', min: 3, max: 4, ideal: 3, color: '#0284c7', desc: '3-4 volte/sett (preferibilmente azzurro)' },
  { id: 'legumi', label: 'Legumi', icon: '🫘', min: 3, max: 4, ideal: 3, color: '#d97706', desc: '3-4 volte/sett (ottime proteine vegetali)' },
  { id: 'carne_bianca', label: 'Carne Bianca', icon: '🍗', min: 2, max: 2, ideal: 2, color: '#16a34a', desc: '2 volte/sett (pollo, tacchino, coniglio)' },
  { id: 'uova', label: 'Uova', icon: '🥚', min: 2, max: 2, ideal: 2, color: '#eab308', desc: '2 volte/sett' },
  { id: 'latticini', label: 'Formaggi/Latticini', icon: '🧀', min: 1, max: 2, ideal: 2, color: '#8b5cf6', desc: '1-2 volte/sett (privilegiare freschi/magri)' },
  { id: 'carne_rossa', label: 'Carne Rossa', icon: '🥩', min: 0, max: 1, ideal: 1, color: '#dc2626', desc: 'Max 1 volta/sett' }
];

const CATEGORIES = [
  { id: 'antipasto', label: 'Antipasti', singular: 'Antipasto', icon: '🫒', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'primo', label: 'Primi', singular: 'Primo', icon: '🍝', color: '#ea580c', bg: '#fff7ed' },
  { id: 'secondo', label: 'Secondi', singular: 'Secondo', icon: '🐟', color: '#0284c7', bg: '#f0f9ff' },
  { id: 'contorno', label: 'Contorni', singular: 'Contorno', icon: '🥗', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'frutta', label: 'Frutta', singular: 'Frutta', icon: '🍎', color: '#e11d48', bg: '#fff1f2' }
];

const GROUPS = [
  { id: 'cereali', label: 'Cereali / Pasta / Riso / Patate', icon: '🌾' },
  { id: 'pesce', label: 'Pesce / Crostacei', icon: '🐟' },
  { id: 'legumi', label: 'Legumi (Ceci, Lenticchie, Fagioli...)', icon: '🫘' },
  { id: 'carne_bianca', label: 'Carne Bianca (Pollo, Tacchino)', icon: '🍗' },
  { id: 'uova', label: 'Uova', icon: '🥚' },
  { id: 'latticini', label: 'Latticini e Formaggi', icon: '🧀' },
  { id: 'carne_rossa', label: 'Carne Rossa / Salumi', icon: '🥩' },
  { id: 'verdura', label: 'Verdura e Ortaggi', icon: '🥦' },
  { id: 'frutta', label: 'Frutta Fresca e Secca', icon: '🍎' }
];

const DAYS_OF_WEEK = [
  { id: 'lun', name: 'Lunedì', short: 'LUN' },
  { id: 'mar', name: 'Martedì', short: 'MAR' },
  { id: 'mer', name: 'Mercoledì', short: 'MER' },
  { id: 'gio', name: 'Giovedì', short: 'GIO' },
  { id: 'ven', name: 'Venerdì', short: 'VEN' },
  { id: 'sab', name: 'Sabato', short: 'SAB' },
  { id: 'dom', name: 'Domenica', short: 'DOM' }
];
