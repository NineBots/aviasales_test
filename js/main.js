//значения фильтра
var filter_values = ["-1"];
//значения сортировки
var sort_value = "Оптимальный";


//при создании
(function(){
  const checkboxAll = document.querySelector("#checkbox_all");
  checkboxAll.checked = new Boolean(true);
  updateTickets();

  // Выбираем все кнопки сортировки
  const sortButtons = document.querySelectorAll(".sort-button");

  //обработчик клика для каждой кнопки
  sortButtons.forEach(button => {
    button.addEventListener("click", () => {

      // Убираем класс "active" у всех кнопок
      sortButtons.forEach(b => b.classList.remove("active"));
      // Добавляем класс "active" нажатой кнопке
      button.classList.add("active");

      sort_value = button.id;
      updateTickets();
    });
  });

  //обработчик изменения для каждого checkbox
  const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {

        filter_values = [];
        //получаем все нажатые чекбоксы
        active_checkboxes = document.querySelectorAll(".checkbox:checked");
        //добавляем их к массиву с фильтрами
        active_checkboxes.forEach(checkbox => filter_values.push(checkbox.value));
        updateTickets();
      });
    });
}());


//получить билеты из источника
async function updateTickets() {
  json_server_url = 'http://localhost:3000/tickets';
  json_local_path = './test_data.json';
  
  try {
    const res = await fetch(json_local_path);
    if (res.ok) {
      const data = await res.json();
      addTickets(data.tickets);
    } else {
      console.error('Ошибка:', res.status);
    }
  } catch (error) {
    const res = await fetch(json_server_url);
    if (res.ok) {
      const data = await res.json();
      addTickets(data.tickets);
    } else {
      console.error('Ошибка:', res.status);
    }
  }
}


//добавить билеты
function addTickets(tickets){
  const ticketsContainer = document.querySelector(".tickets-container");
  ticketsContainer.innerHTML = "";

  //сортировка
  if (sort_value == "fastest"){
    tickets.sort((a,b) => {
      return (a.segments[0].duration + a.segments[1].duration) -
             (b.segments[0].duration + b.segments[1].duration);
    })
  }
  else if(sort_value == "cheapest"){
    tickets.sort((a,b) => {return a.price - b.price})
  }

  //фильтрация и отображение
  tickets_limit = 0;
  ticket_index = 0;
  while(tickets_limit != 5){
    ticket = tickets[ticket_index];
    stops = getNumOfStops(ticket);

    if (filter_values.includes(""+stops) ||
        filter_values.includes("-1") ||
        filter_values.length == 0) {
      putTicketInContainer(ticketsContainer, ticket);
      tickets_limit += 1;
    }
    ticket_index+=1;
  }
  ticketsContainer.innerHTML += `
  <div class="more-elems-button">
    <span class="more-elems-txt">Показать еще 5 билетов!</span>
  </div>
  `
}


//получить кол-во пересадок
function getNumOfStops(ticket){
  stops = 0
  ticket.segments.forEach(segment => {
    segment.stops.forEach(() => stops+=1)
  })
  return stops;
}

//добавить один элемент в контейнер
function putTicketInContainer(container, ticket){
  price = new Intl.NumberFormat().format(ticket.price)
      container.innerHTML += `
      <div class="ticket-card">
        <div class = "ticket-header">
            <div class="price-container">
                <span class="price">${price} Р </span>
            </div>
            <div class="company-img">
            </div>
        </div>
        <table class="ticket-info">
            ${getSegments(ticket)}
        </table>
      </div>`;
}


//заполнить недостающие цифры нулями
function fillWithZeros(length_of_num, num){
  return ('0'.repeat(length_of_num) + num).slice(length_of_num*-1);
}


//получить сегменты билета
function getSegments(ticket){
  segments_html = "";
  ticket.segments.forEach(segment => {
    origin = segment.origin;
    destination = segment.destination;
    departure_date = new Date(segment.date);
    departure_time = dateToTime(departure_date);
    stops = segment.stops;
    duration = segment.duration;
    arrival_date = new Date(departure_date.getTime() + duration * 60 * 1000);
    arrival_time = dateToTime(arrival_date);

    segments_html += `
    <tr class = "info-row">
      <th>
        <div class="ticket-column">
          <span class="grey-ticket-txt">${origin} – ${destination}</span>
          <span class="black-ticket-txt">${departure_time} – ${arrival_time}</span>
        </div>
      </th>
      <th>
        <div class="ticket-column">
          <span class="grey-ticket-txt">В пути</span>
          <span class="black-ticket-txt">${parseInt(duration/60)}ч ${duration%60}м</span>
        </div>
      </th>
      <th>
        <div class="ticket-column">
          <span class="grey-ticket-txt">${stops.length} пересадки</span>
          <span class="black-ticket-txt">${stops.join(',')}</span>
        </div>
      </th>
    </tr>
    `;
  })
  return segments_html;
}


//привести дату к hh:mm
function dateToTime(date){
  return fillWithZeros(2, date.getHours()) + ':' +
          fillWithZeros(2, date.getMinutes());
}

