jQuery(document).ready(function($) {

	function saveUser(id, entry, ajaxURL){
		$.ajax({
		    method: 'GET',
		    url: ajaxURL,
		    data: {
		      id: id,
		      entry: parseInt(entry)
		    }
	  	})
	}

	function notifyUser(id, entry, ajaxURL){
		setTimeout(
			function() 
			{
			alert('You have not saved changes in 4 minutes. Save now or you will lose changes.')
			}, 240000);

		setTimeout(
			function() 
			{
			//lose access to save
			saveUser(0, entry, ajaxURL);
			$('input[type="submit"], button[type="submit"]').attr('disabled','disabled')
			alert('You have not saved changes in 5 minutes. The entry is now locked. Please refresh the page.')
			}, 300000);
	}
	
	//get info
	id = parseInt($('#session li').eq(0).find('a').attr('href').match(/\/([^\/]+)\/?$/)[1]);
	// name = $('#session li').eq(0).find('a').text();
	entry = document.URL.match(/\/([^\/]+)\/?$/)[1];
	ajaxURL = Symphony.Context.get('symphony') + '/extension/multi_user_edit/multi_user/';
	var configDiff = 0;

	//Get minutes to wait from config
	$.ajax({
	    method: 'GET',
	    url: ajaxURL,
	    data: {
	      getDiff: 1
	    },
	    success: function(response){
	    	response = $(response);
	    	if(response.hasClass('diff')){
	    		configDiff = parseInt(response.text());
	    	}
	    }
	});

	//Check if the entry is being used by another author
	$.ajax({
	    method: 'GET',
	    url: ajaxURL,
	    data: {
	      entry: parseInt(entry)
	    },
	    success: function(response){
	    	response = $(response);
	    	if(response.hasClass('locked')){
	    		//if locked, get difference in minutes
	    		diff = response.find('#diff').text();
	    		if(diff > configDiff){
	    			//Gain access to the article as other author is taking too long.
	    			console.log('Exceeded 5 minutes; Updated entry.');
	    			//start the countdown
					notifyUser(id, entry, ajaxURL);
					//save a new entry in DB
	    			saveUser(id, entry, ajaxURL);
	    		}
	    		else{
	    			alert(response.find('.show').text() +' '+ (configDiff - diff).toFixed(2) + ' minute/s to go. (Refreshing when timer is done)');
	    			$('input[type="submit"], button[type="submit"]').attr('disabled','disabled');

	    			newDiff = (configDiff - diff).toFixed(2) + " ";

	    			arr = newDiff.split('.');
	    		
	    			var seconds = (parseInt(arr[0] * 60) + parseInt(arr[1])) * 1000;

					function timeout() {
					    setTimeout(function () {
					        location.reload();
					        timeout();
					    }, seconds);
					};
					timeout();
	    		}
	    	}
	    	else{
		    	//Save User info
				saveUser(id, entry, ajaxURL);
			}
	    }
	  }).done(function(response){
	  	//code..
  	});


});