
console.log('ready ...');
var getCookies = document.cookie;
console.log(getCookies);

if (getCookies) {
 console.log('has cookies');
  
}

function listTimesheets() {  
  var timesheets = [];
  $('#add').hide();
  $.ajax({
      type: "GET",
      dataType: "json",
      url: "/timesheets"}).
      done(function(data, status) {
        console.log(status);
        console.log(data);
        $("tbody").empty();
          
        // iterate through timesheets
        $.each(data, function(index, value){
          
          // initiate local variables to for timesheet propreties
          var itemId = "";
          var title = "";
          var timeSpent = "";
          var rate = "";
          var totalCost = "";
          var description = "";
          var workDate = "";
          
          itemId = value.item_id;
          // iterate through each property of a the podio timesheet
          $.each(value, function(key, value) {
              if (key == 'fields') {
                $.each(value, function(index, value){
                  if (value.label == "Title") title = value.values[0].value; 
                  if (value.label == "Time spent") timeSpent = value.values[0].value;
                  if (value.label == "Hourly rate") rate = value.values[0].value; 
                  if (value.label == "Total cost") totalCost = value.values[0].value; 
                  if (value.label == "Details of work") description = value.values[0].value; 
                  if (value.label == "Date") workDate = value.values[0].start_date;   
                });
                
              } // if fields
          }); // each property of a timesheet
          
          var obj = {
            itemId: itemId,
            title: title, 
            timeSpent: timeSpent,
            rate: rate,
            totalCost: totalCost,
            description: description,
            workDate: workDate
          };
          timesheets.push(obj);
          
        }); // timesheets
        
       timesheetList(timesheets, 'tbody');
        
      }). // done
      fail(function() {
        console.log('fail');
        $("tbody").empty()
        alert("Please login");
      });


} // listTimesheets

function timesheetList(data, selector) {
  $.each(data, function(index, row){
    console.log(row);
    var items = []
    items.push('<tr>');
    items.push('<td>' + row.workDate + '</td>'); 
    // editLink = '<a href="#/edit/' +  row.itemId + '" >';
    items.push('<td><span data-tooltip class="has-tip" title="' + row.description + '">' +          
    row.title + '</span></td></a>'); 
    var timeSpent = parseInt(row.timeSpent)/3600
    items.push('<td>' + timeSpent + '</td>'); 
    items.push('<td>' + row.rate + '</td>'); 
    items.push('<td>' + row.totalCost + '</td>');    
    items.push('<td><span class="[round radius] label">edit</span>&nbsp;&nbsp;' +
      '<span class="[success alert secondary] [round radius] label">delete</span></td>');   
    items.push('</tr>'); 
    $(items.join('')).appendTo(selector);
  
  });
  $('#timesheet').show();
}


function addTimesheet() {
  console.log('add timesheet ...');
  $('#timesheet').hide();
  $('#add').show();
  
}

function home() {
  console.log('home');
  $('#add').hide();
  $('#timesheet').hide();
  
}

Path.map("#/home").to(home);
Path.map("#/list").to(listTimesheets);
Path.map("#/add").to(addTimesheet);
Path.map("#/edit/:item").to(function(){
    alert("Timesheet: " + this.params['item']);
});

Path.root("#/home");
Path.listen();