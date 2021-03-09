"use strict";

var error = function(msg) {
	alert(msg);
};

var icemet_init = function(url) {
	$(".dropdown").each(function() {
		var dropdown = this;
		$(dropdown).find("> button").click(function() {
			$(".dropdown-submenu-content").hide();
			$(dropdown).siblings().each(function() {
				$(this).find("> .dropdown-content").hide();
			});
			$(dropdown).find("> .dropdown-content").toggle();
		});
	});
	$(".dropdown-submenu").each(function() {
		var dropdown = this;
		$(dropdown).find("> button").click(function() {
			$(dropdown).siblings().each(function() {
				$(this).find("> .dropdown-submenu-content").hide();
			});
			$(dropdown).find("> .dropdown-submenu-content").toggle();
		});
	});
	$(document).on("click", function closeMenu (event) {
		if ($(".dropdown").has(event.target).length === 0) {
			$(".dropdown-content").hide();
			$(".dropdown-submenu-content").hide();
		}
	});
};
