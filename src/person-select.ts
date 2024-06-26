import { addNames, getNames } from "firebase";
import { loadCardRestrictions } from "visitor-gift";

export function initPersonSelect() {
    let addItemPerson = document.getElementById("addItemPerson")! as HTMLButtonElement;
    let personList = document.getElementById("personList")! as HTMLElement;
    let personListItemTemplate = document.getElementById("personListItem")! as HTMLTemplateElement;
    let closeButton = document.getElementById("closeButton")!;
    let addNameButton = document.getElementById("addNameButton")!;
    let clearPersonButton = document.getElementById("clearPersonButton")!;
    let nameSelectDialog = document.getElementById("nameSelectDialog")! as HTMLDialogElement;
    let nameSearchInput = document.getElementById("nameSearch")! as HTMLInputElement;
    
    let showDialog = async () => {
        allNames = await getNames();

        nameSelectDialog.showModal();
        nameSearchInput.value = '';
        renderNameList('', onNameClick);
    }


    addItemPerson.addEventListener('click', () => showDialog());
    addItemPerson.addEventListener('keyup', (event) => {
        if (event.key != "Tab" && event.key != "Escape" && event.target == addItemPerson) {
            event.stopImmediatePropagation();
            setTimeout(() => showDialog());
        }
    });
    closeButton.addEventListener("click", () => nameSelectDialog.close(''));
    nameSelectDialog.addEventListener('close', (event) => {
        addPerson(nameSelectDialog.returnValue);
    });
    addNameButton.addEventListener('click', async () => {
        let names = nameSearchInput.value.split(',').map(x => x.trim()).filter(x => x);
        names = names.filter(name => !allNames.includes(name));
        await addNames(names);
        allNames = allNames.concat(names);
        renderNameList(nameSearchInput.value, onNameClick);
    });

    let onNameClick = (name: string) => {
        setTimeout(() => nameSelectDialog.close(name));
    }
    let names = renderNameList('', onNameClick);
    
    nameSearchInput.addEventListener('keyup', (event) => {
        names = renderNameList(nameSearchInput.value, onNameClick);
        if (event.key == "Enter") {
            event.stopImmediatePropagation();
            setTimeout(() => nameSelectDialog.close(names[0]));
        }
        if (event.key == "ArrowDown") {
            (document.querySelector(".name-select__list-item") as HTMLLinkElement)?.focus();
        }
    });
}

const SELECTED_PERSON_CLASS = "selected";
export function addPerson(name: string) {
    let personList = document.getElementById("personList")! as HTMLElement;
    let personListItemTemplate = document.getElementById("personListItem")! as HTMLTemplateElement;
    let personListItemFragment = document.importNode(personListItemTemplate.content, true);
    let personListItem = personListItemFragment.querySelector(".gift-add-item__person-list-item")!;
    personListItem.textContent = name || "<не указано>";
    personListItem.setAttribute("data-name", name);
    personListItem.addEventListener("click", (event) => {
        selectPerson((event.target as HTMLElement).getAttribute("data-name"));

    });
    personList.appendChild(personListItem);
    selectPerson(name);
}

export function selectPerson(name: string | null) {
    let personList = document.getElementById("personList")! as HTMLElement;
    let items = personList.querySelectorAll(".gift-add-item__person-list-item");
    for (let i = 0; i < items.length; i++) {
        if (items[i].getAttribute("data-name") == name) {
            items[i].classList.add(SELECTED_PERSON_CLASS);
        } else {
            items[i].classList.remove(SELECTED_PERSON_CLASS);
        }
    }
    loadCardRestrictions()
}

function renderNameList(search: string, onItemClick: (name: string) => void) {
    let nameList = document.getElementById("nameList")!;    
    let nameListItemTemplate = document.getElementById("nameListItem")! as HTMLTemplateElement;
    let nameSearchInput = document.getElementById("nameSearch")! as HTMLInputElement;

    nameList.innerHTML = '';
    let names = search ? allNames.filter(x => x.toLocaleLowerCase().startsWith(search.toLocaleLowerCase())) : allNames;
    for (let name of names) {
        let nameListItemFragment = document.importNode(nameListItemTemplate.content, true);
        let nameListItem = nameListItemFragment.querySelector(".name-select__list-item")! as HTMLLinkElement;
        nameListItem.innerHTML = name;
        nameListItem.addEventListener('click', (event) => onItemClick((event.target as HTMLElement).innerText));
        nameListItem.addEventListener('keyup', (event) => {
            if (event.key == "ArrowDown" || event.key == "ArrowRight") {
                (nameListItem.nextSibling as HTMLLinkElement)?.focus();
            } else if (event.key == "ArrowUp" || event.key == "ArrowLeft") {
                (nameListItem.previousSibling as HTMLLinkElement)?.focus();
                if (!nameListItem.previousSibling) {
                    nameSearchInput.focus();
                }
            } else if (event.key == "Enter" || event.key == "Space") {
                event.stopImmediatePropagation();
                event.preventDefault();
                setTimeout(() => onItemClick((event.target as HTMLElement).innerText));
            }
        });
        nameList.append(nameListItem);
    }
    return names;
}

let allNames = [
    'Августа', 'Авдотья', 'Аврора', 'Агата', 'Аглая', 'Агнесса', 'Агния', 'Ада', 'Адель', 'Аза', 'Азалия', 'Аида', 
    'Аксинья', 'Акулина', 'Алевтина', 'Александра', 'Алексия', 'Алёна', 'Алина', 'Алиса', 'Алла', 'Альберта', 
    'Амалия', 'Анастасия', 'Ангелина', 'Андриана', 'Анеля', 'Анжела', 'Анжелика', 'Анисья', 'Анита', 'Анна', 
    'Антонина', 'Анфиса', 'Апрелия', 'Ариадна', 'Арина', 'Арсения', 'Ассоль', 'Астра', 'Ася', 'Аурика', 'Аэлита', 
    'Бажена', 'Беата', 'Беатриса', 'Белла', 'Беляна', 'Береслава', 'Берта', 'Богдана', 'Божена', 'Бронислава', 
    'Валентина', 'Валерия', 'Ванда', 'Ванесса', 'Варвара', 'Василина', 'Василиса', 'Васса', 'Веда', 'Венера', 
    'Вера', 'Вероника', 'Веселина', 'Веста', 'Вета', 'Вивиана', 'Видана', 'Виктория', 'Вилора', 'Виола', 'Виринея', 
    'Виталия', 'Влада', 'Владилена', 'Владимира', 'Владислава', 'Власта', 'Воля', 'Всеслава', 'Габриэлла', 'Гайя', 
    'Галина', 'Гелия', 'Гелла', 'Гера', 'Герда', 'Глафира', 'Глория', 'Грация', 'Грета', 'Дайна', 'Дана', 'Даниэла', 
    'Дарина', 'Дарья', 'Дарьяна', 'Декабрина', 'Дея', 'Дженни', 'Джулия', 'Диана', 'Дина', 'Добрава', 'Доля', 
    'Доминика', 'Дорофея', 'Ева', 'Евгения', 'Евдокия', 'Екатерина', 'Елена', 'Елизавета', 'Емельяна', 'Есения', 
    'Ефимия', 'Ефросиния', 'Жанна', 'Жасмин', 'Ждана', 'Забава', 'Залина', 'Зара', 'Зарема', 'Зарина', 'Звана', 
    'Звенислава', 'Земфира', 'Зинаида', 'Зиновия', 'Зита', 'Злата', 'Златослава', 'Зоряна', 'Зоя', 'Иванна', 'Ивона', 
    'Ида', 'Изабелла', 'Изольда', 'Илона', 'Иля', 'Инга', 'Инесса', 'Инна', 'Иоанна', 'Иоланта', 'Ирина', 'Ирма', 
    'Искра', 'Июлия', 'Камилла', 'Карина', 'Каролина', 'Катарина', 'Кира', 'Клавдия', 'Клара', 'Кристина', 'Ксения', 
    'Лада', 'Лана', 'Лара', 'Лариса', 'Лаура', 'Леля', 'Лера', 'Леся', 'Лиана', 'Лидия', 'Лика', 'Лилиана', 'Лилия', 
    'Лина', 'Линда', 'Лира', 'Лия', 'Лолита', 'Лора', 'Луиза', 'Любава', 'Любовь', 'Людмила', 'Майя', 'Малика', 
    'Мальвина', 'Маргарита', 'Марианна', 'Марина', 'Мария', 'Марта', 'Матрена', 'Мелания', 'Мелисса', 'Мила', 
    'Милада', 'Милана', 'Милолика', 'Милослава', 'Мира', 'Мирослава', 'Мишель', 'Мия', 'Млада', 'Моника', 'Муза', 
    'Надежда', 'Нана', 'Наталья', 'Нева', 'Нелли', 'Ника', 'Николина', 'Николь', 'Нила', 'Нина', 'Нинель', 'Нона', 
    'Оксана', 'Олеся', 'Олимпия', 'Ольга', 'Пелагея', 'Полина', 'Прасковья', 'Рада', 'Раиса', 'Регина', 'Рената', 
    'Риана', 'Римма', 'Рита', 'Роберта', 'Рогнеда', 'Роза', 'Роксана', 'Ростислава', 'Рузана', 'Руслана', 'Руфина', 
    'Сабрина', 'Сандра', 'Светлана', 'Святослава', 'Северина', 'Селена', 'Серафима', 'Сильвия', 'Слава', 'Славяна', 
    'Снежана', 'Соня', 'София', 'Станислава', 'Стелла', 'Стефания', 'Таисия', 'Тамара', 'Татьяна', 'Ульяна', 'Урсула', 
    'Услада', 'Устина', 'Фаина', 'Феба', 'Фекла', 'Фрида', 'Хана', 'Хельга', 'Хлоя', 'Христина', 'Царина', 'Цветана', 
    'Цецилия', 'Чулпан', 'Шанель', 'Шарлотта', 'Шейла', 'Эвелина', 'Эдита', 'Элеонора', 'Элина', 'Элла', 'Элоиза', 
    'Эльвира', 'Эльза', 'Эльмира', 'Эмилия', 'Эмма', 'Эрика', 'Эсмеральда', 'Эстер', 'Эшли', 'Юлиана', 'Юлия', 'Юна', 
    'Юния', 'Юнона', 'Ядвига', 'Яна', 'Янина', 'Ярина', 'Яромира', 'Ярослава', 'Ясмина', 'Август', 'Агап', 'Агафон', 
    'Адам', 'Адриан', 'Азарий', 'Аким', 'Алан', 'Александр', 'Алексей', 'Альберт', 'Анатолий', 'Андрей', 'Антип', 
    'Антон', 'Анфим', 'Аполлинарий', 'Арий', 'Аристарх', 'Аркадий', 'Арно', 'Арнольд', 'Арсений', 'Артем', 'Артемий', 
    'Артур', 'Архип', 'Афанасий', 'Боголюб', 'Болеслав', 'Борис', 'Борислав', 'Бронислав', 'Вадим', 'Валентин', 
    'Валерий', 'Вальдемар', 'Варфоломей', 'Василий', 'Ватслав', 'Велизар', 'Венедикт', 'Вениамин', 'Викентий', 
    'Виктор', 'Вилен', 'Виссарион', 'Виталий', 'Владимир', 'Владислав', 'Владлен', 'Власий', 'Володар', 'Всеволод', 
    'Вячеслав', 'Гектор', 'Геннадий', 'Георгий', 'Герасим', 'Герман', 'Глеб', 'Горислав', 'Григорий', 'Даниил', 
    'Данислав', 'Демид', 'Демьян', 'Денис', 'Дмитрий', 'Добрыня', 'Дорофей', 'Евгений', 'Евграф', 'Евдоким', 
    'Евсей', 'Евстафий', 'Егор', 'Елизар', 'Елисей', 'Емельян', 'Еремей', 'Ермак', 'Ермил', 'Ермолай', 'Ерофей', 
    'Ефим', 'Ефрем', 'Жан', 'Захар', 'Зигмунд', 'Зиновий', 'Зосима', 'Зураб', 'Иван', 'Игнат', 'Игнатий', 'Игорь', 
    'Илларион', 'Илья', 'Инокентий', 'Ипполит', 'Казимир', 'Кай', 'Камиль', 'Ким', 'Кир', 'Кирилл', 'Клавдий', 
    'Клим', 'Кондрат', 'Константин', 'Корней', 'Корнелий', 'Кузьма', 'Лавр', 'Лаврентий', 'Лазарь', 'Ларион', 
    'Лев', 'Леонард', 'Леонид', 'Леонтий', 'Лука', 'Лукьян', 'Любомир', 'Макар', 'Макарий', 'Максим', 'Максимильян', 
    'Марк', 'Маркел', 'Марсель', 'Мартин', 'Матвей', 'Мечеслав', 'Микула', 'Милан', 'Мирон', 'Мирослав', 'Митрофан', 
    'Михаил', 'Модест', 'Мстислав', 'Нестор', 'Никанор', 'Никита', 'Никифор', 'Никодим', 'Никола', 'Николай', 
    'Олег', 'Онисим', 'Орест', 'Осип', 'Остап', 'Павел', 'Панкрат', 'Парамон', 'Пахом', 'Петр', 'Порфирий', 'Потап', 
    'Прокофий', 'Прохор', 'Радомир', 'Радослав', 'Рафаэль', 'Ренат', 'Роберт', 'Родион', 'Ролан', 'Роман', 
    'Ростислав', 'Рудольф', 'Савелий', 'Светозар', 'Святослав', 'Семен', 'Серафим', 'Сергей', 'Спартак', 'Спиридон', 
    'Станислав', 'Степан', 'Стефан', 'Тарас', 'Терентий', 'Тимофей', 'Тихомир', 'Тихон', 'Трифон', 'Трофим', 'Ульян', 
    'Устин', 'Федор', 'Федот', 'Феликс', 'Феофан', 'Филарет', 'Филат', 'Филимон', 'Филипп', 'Фирс', 'Фома', 'Фрол', 
    'Харитон', 'Эдуард', 'Эмилий', 'Эраст', 'Эрик', 'Эрнест', 'Юлиан', 'Юлий', 'Юрий', 'Юст', 'Яков', 'Ян', 
    'Януарий', 'Яромир', 'Ярослав', 'Сербия', 'Динара', 'Сардар', 'Арсен', 'Альбина',
    'Мадина', 'Тамерлан', 'Латвина', 'Рустам', 'Аделина', 'Милорд', 'Франц', 'Ратха', 'Аделина',
    'Мадина', 'Шараф','Бехруз', 'Пагран', 'Чингиз'
];
    