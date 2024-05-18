//значения фильтра
var filter_values = ["-1"];
//значения сортировки
var sort_value = "Оптимальный";


//при создании страницы
(function(){

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
        if(checkbox.checked){
          checkbox.classList.add("checked");
          checkbox.closest("li").classList.add("active")
        }
        else{
          checkbox.classList.remove("checked");
          checkbox.closest("li").classList.remove("active")
        }
        //получаем все нажатые чекбоксы
        const active_checkboxes = document.querySelectorAll(".checkbox:checked");
        //добавляем их к массиву с фильтрами
        active_checkboxes.forEach(checkbox => filter_values.push(checkbox.value));
        updateTickets();
      });
    });
}());


//получить билеты из источника
async function updateTickets() {
  const json_server_url = 'http://localhost:3000/tickets';
  const json_local_path = './test_data.json';
  
  try {
    const res = await fetch(json_local_path);
    if (res.ok) {
      const data = await res.json();
      addTickets(data.tickets);
    } else {
      console.error('Ошибка:', res.status);
    }
  } catch{
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
  let tickets_limit = 0;
  let ticket_index = 0;
  while(tickets_limit != 5){
    const ticket = tickets[ticket_index];
    const stops = getNumOfStops(ticket);

    if (filter_values.includes(""+stops) ||
        filter_values.includes("-1") ||
        filter_values.length == 0) {
      putTicketInContainer(ticketsContainer, ticket);
      tickets_limit += 1;
    }
    ticket_index+=1;
  }
}


//получить кол-во пересадок
function getNumOfStops(ticket){
  let stops = 0
  ticket.segments.forEach(segment => {
    segment.stops.forEach(() => stops+=1)
  })
  return stops;
}


//добавить один элемент в контейнер
function putTicketInContainer(container, ticket){
  const price = new Intl.NumberFormat().format(ticket.price)
  const img_src = "https://pics.avs.io/99/36/" + ticket.carrier + ".png";
      container.innerHTML += `
      <div class="ticket-card">
        <div class = "ticket-header">
            <div class="price-container">
                <span class="price">${price} Р </span>
            </div>
            <div class="company-img-container">
              <img class="company-img" src="${img_src}"/>
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
  let segments_html = "";
  ticket.segments.forEach(segment => {
    const origin = segment.origin;
    const destination = segment.destination;
    const departure_date = new Date(segment.date);
    const departure_time = dateToTime(departure_date);
    const stops = segment.stops;
    const duration = segment.duration;
    const arrival_date = new Date(departure_date.getTime() + duration * 60 * 1000);
    const arrival_time = dateToTime(arrival_date);

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

