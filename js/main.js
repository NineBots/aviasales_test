var filter_values = ["-1"];
var sort_value = "Оптимальный";
(function(){
  const checkboxAll = document.querySelector("#checkbox_all");
  checkboxAll.checked = new Boolean(true);
  updateTickets_Local();

  // Выбираем все кнопки сортировки
  const sortButtons = document.querySelectorAll(".sort-button");

  // Добавляем обработчик клика для каждой кнопки
  sortButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Убираем класс "active" у всех кнопок
      sortButtons.forEach(b => b.classList.remove("active"));

      // Добавляем класс "active" нажатой кнопке
      button.classList.add("active");
      sort_value = button.id;
      updateTickets_Local();
    });
  });

  const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        filter_values = [];
        active_checkboxes = document.querySelectorAll(".checkbox:checked");
        active_checkboxes.forEach(checkbox => filter_values.push(checkbox.value));
        updateTickets_Local();
      });
    });
}());

function updateTickets_Local(){
  fetch('http://localhost:3000/tickets',{
    method: "GET"})  
  .then(res => {
    if(res.ok){
      return res.json();
    }
    else{
      console.log(error);
    }
  })
  .then(data => addTickets(data))
  .catch(updateTickets_Public())
}

function updateTickets_Public(){
  fetch('./test_data.json')
   .then(res => {
      return res.json();
  })
  .then(data => addTickets(data.tickets))
  }

function addTickets(tickets){
  const ticketsContainer = document.querySelector(".tickets-container");
  ticketsContainer.innerHTML = "";
  tickets_limit = 0;
  ticket_index=0;
  if(sort_value == "fastest"){
    tickets.sort((a,b) => {
      a_duration = a.segments[0].duration + a.segments[1].duration;
      b_duration = b.segments[0].duration + b.segments[1].duration;
      return a_duration-b_duration;
    })
  }
  else if(sort_value == "cheapest"){
    tickets.sort((a,b) => {
      a_price = a.price;
      b_price = b.price;
      return a_price-b_price;
    })
  }
  while(tickets_limit != 5){
    ticket = tickets[ticket_index];
    stops = 0;
    ticket.segments.forEach(segment => {
      segment.stops.forEach(() => stops+=1)
    })
    if(filter_values.includes(""+stops) || filter_values.includes("-1") || filter_values.length == 0){
      price = new Intl.NumberFormat().format(ticket.price)
      ticketsContainer.innerHTML += `
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
      tickets_limit += 1;
    }
    ticket_index+=1;

  }
}

function fillWithZeros(length_of_num, num){
  return ('0'.repeat(length_of_num) + num).slice(length_of_num*-1);
}
function getSegments(ticket){
  console.log(ticket);
  segments_html = "";
  ticket.segments.forEach(segment => {
    origin = segment.origin;
    destination = segment.destination;
    departure_date = new Date(segment.date);
    departure_time = fillWithZeros(2,departure_date.getHours()) + ':' + fillWithZeros(2,departure_date.getMinutes());
    stops = segment.stops;
    duration = segment.duration;
    arrival_date = new Date(departure_date.getTime() + duration * 60 * 1000);
    arrival_time = `${fillWithZeros(2,arrival_date.getHours())}:${fillWithZeros(2,arrival_date.getMinutes())}`;
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

