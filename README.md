# Кейс No 6 «Sea Battle: Разработка Web-игры по принципу морского боя для розыгрыша призов»

## Установка и запуск
1. Предварительно установить интерпритатор Python и все необходимые библиотеки (см. документацию)
2. Зайти в папку, в которую вы хотите установить продукт
3. В терминале по данному пути прописать:
``` batch
git clone "https://github.com/BeyondOrigins/predprof"
cd predprof
py main.py
```
4. Сайт запущен по адресу 127.0.0.1:5000
## Схема организации данных
![Схема организации данных](/images/db.jpg)

## Описание функциональных блоков

### 2.1	. Регистрация пользователей и администраторов
Разграничение прав доступа (пользователь, админ) осуществляется посредством ввода при регистрации уникального для всех администраторов кода, указанного в базе данных, после которой логины и пароли пользователя/администратора добавляются в отдельные таблицы для корректного отображения личных кабинетов.

### 2.1.1 Схема модуля регистрации:
Из браузера на сервер приходят следующие данные: логин, пароль и код администратора. При регистрации проверяется уникальность логина, если такой логин уже существует выводится сообщение «Этот логин уже использован». При вводе пароля проверяется его длина для обеспечения безопасности: в случае, если пароль короче 8 символов, выводится сообщение «Пароль должен быть длиной от 8 символов». Далее происходит проверка на наличие кода администратора: если он есть, то проверяется правильность, в противном случае user-a регистрируют в роли пользователя. При неверно введенном коде администратора выводится ошибка 401: «Неверный код администратора».

### 2.2	 Авторизация для пользователей и администраторов

При нажатии на кнопку «Начать игру» появляется модальное окно с ячейками для ввода логина и пароля. После ввода данных выводится сообщение об успешном/неуспешном входе.
 
После авторизации в системе пользователя пересылает на новую страницу по следующему алгоритму:

User делает запрос get на сервер, далее сервер по переданным данным определяет тип пользователя: если это администратор, то ему возвращается страница для создания поля, иначе проверяется назначен ли пользователь на данное поле, если нет, то происходит возврат пользователя на страницу с доступными полями.

### 2.3 Механика создания игрового поля
Войдя в систему, администратор выбирает в специальном поле размерность игрового поля – число N. Далее администратор расставляет корабли на выбранном поле, что осуществляется в коде при помощи Relationship, то есть к полю прикреплен список кораблей, а каждый корабль в свою очередь хранит ID поля.

При прикреплении к кораблю приза его ID записывается в поле Prize_id внутри корабля.  
Пока администратор не прикрепит приз к кораблю, сохранить положение корабля, как и разместить следующий, нельзя (кнопка «Готово» не активна).

### 2.4 Редактирование поля
Из браузера на сервер поступает такой же json как и при создании поля. Далее идет проверка типа пользователя: если это обычный пользователь, то его возвращает на главную страницу, если это админ – то он вносит изменения, информация о которых заносится в базу данных.

### 2.5 Механика осуществления выстрела пользователем:

При входе в аккаунт проверяется статус пользователя: если это администратор, то совершение выстрела запрещено, при этом выводится сообщение; если же это не администратор, то идет проверка на наличие выстрелов. Далее если пользователь хочет выстрелить в клетку, в которую ранее попали, вновь выводится ошибка. Если же в эту клетку еще не стреляли, то количество выстрелов у пользователя уменьшается на 1.

## Скриншоты программного продукты

### Регистрация администраторов
![Регистрация администраторов](/images/admin-logup.png)

### Поле для ввода кода становится активным при нажатии на чекбокс
![Поле для ввода кода становится активным при нажатии на чекбокс](/images/checkbox.png)

### Вывод сообщения об успешном входе
![Сообщение об успешном входе](/images/login-success.png)

### Вывод сообщения при неверных данных
![Ошибка введённых данных](/images/login-success.png)

### Расстановка кораблей на поле
![Расстановка кораблей](/images/ships.png)

### Прикрепление приза к кораблю
![Прикрепление приза к кораблю](/images/prizes.png)

### Фильтрация по признаку принадлежности к полю
![Фильтрация по признаку принадлежности к полю](/images/filter_field.jpg)

### Фильтрация по признаку получения
![Фильтрация по признаку получения](/images/filter_user.jpg)
