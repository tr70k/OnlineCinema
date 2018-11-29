const mongoose = require('mongoose');
const config = require('config');
const log = require('libs/log')(module);

const users = [
    {username: "Sema", password: "pass123", email: "sema@gmail.com"},
    {username: "Sasha", password: "my_pass", email: "sasha@gmail.com"},
    {username: "Sasha", password: "my_pass", email: "sasha@gmail.com"},
    {username: "Roma", password: "qwerty", email: "roma@gmail.com"}
    ];

const genres = [
    {number: 1, count: 0, title_orig: "Anime", title: "Аниме", description: "Аниме – разновидность мультипликации родом из Японии, рассчитанная по большей части на взрослую и юношескую аудиторию и отличающаяся своеобразной манерой отрисовки фонов и персонажей."},
    {number: 2, count: 0, title_orig: "Biography", title: "Биографический", description: "Биографический фильм – жанр кинематографа, повествующий о судьбе какой-либо известной, выдающейся личности, оставившей свой след в истории."},
    {number: 3, count: 0, title_orig: "Action", title: "Боевик", description: "Боевик – кинематографический жанр, в котором главный герои или герои сталкиваются с рядом проблем, решить которые, не прибегнув к насилию, не удается."},
    {number: 4, count: 0, title_orig: "Western", title: "Вестерн", description: "Фильмы вестерны – одно из направлений некогда очень популярного в США искусства вестерн (в буквальном переводе – западный)."},
    {number: 5, count: 0, title_orig: "War", title: "Военный", description: "Военные фильмы – жанр кинематографического искусства, посвященный войне и приемам ее ведения."},
    {number: 6, count: 0, title_orig: "Detective", title: "Детектив", description: "Детективные фильмы – жанр кинематографа, главный герои или герои которого пытаются найти решение какой-либо проблемы или раскрыть преступление."},
    {number: 7, count: 0, title_orig: "Children", title: "Детский", description: "Фильмы для детей – создаваемые специально для детей и подростков произведения киноискусства, при создании которых учитываются особенности эстетического восприятия детей, специфика их мышления и другие возрастные особенности."},
    {number: 8, count: 0, title_orig: "Documentary", title: "Документальный", description: "Документальные фильмы, называемые также неигровыми, – жанр кинематографа, в основе которого лежат съемки реальных лиц и событий."},
    {number: 9, count: 0, title_orig: "Drama", title: "Драма", description: "Драматические фильмы – эти фильмы повествуют о частной жизни и социальных конфликтах персонажей, акцентируя внимание на воплощенных в их поступках и поведении общечеловеческих противоречиях."},
    {number: 10, count: 0, title_orig: "History", title: "Исторический", description: "Исторические фильмы – жанр игрового кинематографа, повествующий о той или иной эпохе, людях и событиях прошлых лет."},
    {number: 11, count: 0, title_orig: "Comics", title: "Кинокомикс", description: "Кинокомиксы – произведения киноискусства (фильмы, мультфильмы и сериалы), в основе которых лежат сюжеты известных комиксов."},
    {number: 12, count: 0, title_orig: "Comedy", title: "Комедия", description: "Комедии - фильмы, которые ставят целью рассмешить зрителя, вызвать улыбку, улучшить настроение."},
    {number: 13, count: 0, title_orig: "Concert", title: "Концерт", description: "Концертный фильм или концертное кино – кинематографический жанр, освещающий живые выступления известных певцов, музыкантов и комедиантов."},
    {number: 14, count: 0, title_orig: "Short", title: "Короткометражный", description: "Короткометражным фильмом считается любой игровой или анимационный фильм, продолжительность которого недостаточна для того, чтобы он мог называться полнометражным."},
    {number: 15, count: 0, title_orig: "Crime", title: "Криминал", description: "Криминальные фильмы – кинематографический жанр, фокусирующийся на криминале и так или иначе связанными с ним темами."},
    {number: 16, count: 0, title_orig: "Melodrama", title: "Мелодрама", description: "Фильмы мелодрамы – жанр кинематографа с усиленной чувственной и эмоциональной составляющей, заметно превалирующей над детализацией персонажей, которые зачастую изображаются схематично и стереотипно."},
    {number: 17, count: 0, title_orig: "Mystery", title: "Мистика", description: "Мистика – пользующееся большой популярностью направление игрового кинематографа, поднимающее темы сверхъестественного (ясновиденье, магия, некромантия, спиритические и медиумические явления, вампиры, оборотни и др.)."},
    {number: 18, count: 0, title_orig: "Music", title: "Музыка", description: "Музыкальные фильмы – жанр кинематографического искусства, посвященный музыке и всему, что с ней связано."},
    {number: 19, count: 0, title_orig: "Animation", title: "Мультфильм", description: "Мультипликационные фильмы, мультфильмы или анимация – фильмы, в процессе создания которых иллюзия движения и трансформации объектов создается посредством ускоренной демонстрации серии минимально различающихся между собой неподвижных изображений. "},
    {number: 20, count: 0, title_orig: "Musical", title: "Мюзикл", description: "Фильмы мюзиклы – кинематографический жанр, в котором исполняемые персонажами песни, иногда сопровождаемые танцами, являются важной частью сюжетной линии."},
    {number: 21, count: 0, title_orig: "Sci-Fi", title: "Научно-популярный", description: "Научно-популярные фильмы – жанр неигрового (документального) кинематографа, простым и доступным языком описывающий окружающий мир с научной точки зрения."},
    {number: 22, count: 0, title_orig: "Adventure", title: "Приключения", description: "Приключенческие фильмы – жанр кинематографического искусства, характерными особенностями которого являются дух авантюризма, стремительность развития сюжета и его неожиданные повороты, преувеличенность переживаний, а также отчетливое деление персонажей на хороших и плохих."},
    {number: 23, count: 0, title_orig: "Reality-TV", title: "Реалити-шоу", description: "Реалити-шоу – жанр телевизионных передач, документирующих якобы импровизированные ситуации из реальной жизни."},
    {number: 24, count: 0, title_orig: "Family", title: "Семейный", description: "Семейные фильмы – жанр кинематографа, продукция которого рассчитана на различные возрастные группы и, соответственно, вообще не содержит неподходящих для детей материалов."},
    {number: 25, count: 0, title_orig: "Sport", title: "Спорт", description: "Спортивные фильмы – произведения кинематографического искусства, основной темой которых является спорт и все что с ним непосредственно связано."},
    {number: 26, count: 0, title_orig: "Talk-Show", title: "Ток-шоу", description: "Ток-шоу – жанр телевизионных передач, в котором приглашенные в студию участники обсуждают различные темы вместе с одним или несколькими ведущими."},
    {number: 27, count: 0, title_orig: "Thriller", title: "Триллер", description: "Триллер – телевизионный и кинематографический жанр, с множеством поджанров. Характерной и определяющей чертой триллеров являются вызываемые ими чувства тревоги, неопределенности, возбуждения и удивления."},
    {number: 28, count: 0, title_orig: "Horror", title: "Ужасы", description: "Фильмы ужасов – произведения кинематографического искусства, основной задачей которых является вызывать у зрителей негативную эмоциональную реакцию, играя на примитивных чувствах страха и отвращения."},
    {number: 29, count: 0, title_orig: "Fantastic", title: "Фантастика", description: "Фантастические фильмы – произведения игрового кинематографа, сюжет которых основывается на фантастических спекуляциях в области гуманитарных, естественных и технических наук."},
    {number: 30, count: 0, title_orig: "Film-Noir", title: "Фильм-нуар", description: "Фильм-нуар – кинематографический термин, под которым чаще всего понимают голливудские криминальные и детективные драмы, которые были произведены в период с начала 1940-х до конца 1950-х годов."},
    {number: 31, count: 0, title_orig: "Fantasy", title: "Фэнтези", description: "Фэнтези – жанр игрового кинематографа, в основе произведений которого лежат сказочные и мифологические мотивы."},
    {number: 32, count: 0, title_orig: "Erotic", title: "Эротика", description: "Эротические фильмы – произведения кинематографического искусства, посвященные темам половой любви, половой чувственности и так или иначе связанными с этими понятиями темам."}
    ];

mongoose.connect(config.get('mongoose:uri'), {useNewUrlParser: true})
    // .then(() => mongoose.connection.db.dropDatabase())
    // .then(function () {
    //     require('models/user').User;
    //     return mongoose.models.User.init();
    // })
    // .then(() => mongoose.models.User.create(users))
    // .catch((err) => log.error(err.message))
    // .then(() => mongoose.models.User.find({}, {username: true, _id: false}))
    // .then((users) => log.info('create users: ' + users))

    .then(function () {
        require('models/genre').Genre;
        return mongoose.models.Genre.init();
    })
    .then(() => mongoose.models.Genre.create(genres))
    .catch((err) => log.error(err.message))
    .then(() => mongoose.models.Genre.find({}, {title_orig: true, title: true, _id: false}))
    .then((users) => log.info('create genres: ' + users))
    .then(() => mongoose.models.Genre.getNumbersByTitles(["Боевик", "Комедия", "Фантастика", "Приключения"]))
    .then((numbers) => log.info('"Боевик", "Комедия", "Фантастика", "Приключения" = ' + numbers))
    .catch((err) => log.error(err.message))
    .then(() => mongoose.models.Genre.getTitlesByNumbers([2, 4, 6]))
    .then((names) => log.info('[2, 4, 6] = ' + names))
    .catch((err) => log.error(err.message))

    // .then(function () {
    //     require('models/genre').Genre;
    //     return mongoose.models.Genre.init();
    // })
    // .then(() => {
    //     require('models/movie').Movie;
    //     return mongoose.models.Movie.init();
    // })
    // .then(() => mongoose.models.Genre.find({count: {$gt: 0}}, {title: true, _id: false}))
    // .then((genres) => log.info('genres: ' + genres))
    // .then(() => mongoose.models.Movie.find({}, {title: true, _id: false}))
    // .then((movies) => console.log('movies: ' + movies))
    // .then(() => mongoose.models.Movie.del("game-of-thrones"))
    // .then(() => console.log("delete"))
    // .catch((err) => log.error(err.message))

    // .then(() => mongoose.models.Genre.find({count: {$gt: 0}}, {title: true, _id: false}))
    // .then((genres) => log.info('genres: ' + genres))
    // .then(() => mongoose.models.Movie.find({}, {title: true, _id: false}))
    // .then((movies) => console.log('movies: ' + movies))
    // .then(() => mongoose.models.Movie.del("shrek"))
    // .then(() => console.log("delete"))
    // .catch((err) => log.error(err.message))

    // .then(() => mongoose.models.Genre.find({count: {$gt: 0}}, {title: true, _id: false}))
    // .then((genres) => log.info('genres: ' + genres))
    // .then(() => mongoose.models.Movie.find({}, {title: true, _id: false}))
    // .then((movies) => console.log('movies: ' + movies))

    .then(() => mongoose.disconnect());

