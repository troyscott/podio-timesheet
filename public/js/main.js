
console.log('ready ...');
var appCookies = document.cookie;
console.log(appCookies);

if (appCookies) {
  console.log('Cookies ...');
  console.log(getCookie('auth'));
      
}

if (getCookie('auth') == 'true') {
 console.log('User is logged in ...');
 $('#menu').show(); 
 $('#menu_settings').show();  
 $('#user').replaceWith('<a id="user" href="/logout">Logout</a>');  
} else
{
  $('#menu').hide(); 
  $('#menu_settings').hide();
  $('#menu_timesheet').hide(); 
  $('#add').hide();
  $('#timesheet').hide();
  $('#user').replaceWith('<a id="user" href="/login">Login</a>');  
  
}

function getCookie(cname)
{
var name = cname + "=";
var ca = document.cookie.split(';');
for(var i=0; i<ca.length; i++) 
  {
  var c = ca[i].trim();
  if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
return "";
}


function listTimesheets() { 
  $('#list').load('list.html', function(){
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
        
       timesheetTable(timesheets, 'tbody');
        
      }). // done
      fail(function() {
        console.log('fail');
        $("tbody").empty()
        alert("Please login");
      });

  }); // load

} // listTimesheets

function timesheetTable(data, selector) {
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


function getWorkspaces(){
  
  $('#org').load('workspaces.html', function(){
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "/organizations"}).
      done(function(data, status) {
        console.log(status);
        console.log(data);
        // loop through the array of organizations
        var items = [];
        items.push('<select id="select_workspace">');
        $.each(data, function(index, org){
          console.log(org.name);
          console.log(org.org_id);
          console.log(org.spaces);
          $.each(org.spaces, function(key,space) {
            console.log(space.name);
            console.log(space.space_id);
            //<option value="husker">Husker</option>
            items.push('<option value="' + space.space_id + '">');
            items.push(org.name + ' - ' + space.name);
            items.push('</option>'); 
          });
          
          }); // each
        
          items.push('</select>');
          console.log(items);
          $(items.join('')).appendTo('#workspaces');
      }). // done
      fail(function() {
        console.log('fail');
        alert("Please login");
      });
    
    
  }); // load
  
}



function addTimesheet() {
  console.log('add timesheet ...');
  $('#timesheet').hide();
  $('#add').load('add.html');
  $('#add').show();
  
}



function home() {
  console.log('home');
  $('#add').hide();
  $('#timesheet').hide();
  //$('#add').load('index.html');
  
}

Path.map("#/apps").to(function() {
  workspaceId = $('#select_workspace').val();
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/apps?id=" + workspaceId}).
    done(function(data, status) {
     console.log('success');
      console.log(data);
      }).
      fail(function() {
         console.log('fail');
      });
  
});

Path.map("#/home").to(home);
Path.map("#/list").to(listTimesheets);
Path.map("#/add").to(addTimesheet);
Path.map("#/edit/:item").to(function(){
    alert("Timesheet: " + this.params['item']);
});
Path.map("#/workspaces").to(getWorkspaces);

Path.root("#/home");
Path.listen();