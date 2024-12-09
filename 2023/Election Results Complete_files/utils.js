function submitReCaptcha(evt, action, validate) {
  let form = evt.target;
  if (!(form instanceof HTMLFormElement)) {
    form = $(evt.target).closest("form").get(0);
  }
  if (validate) {
    if (validate()) {
      submitReCaptchaForm(form, action);
    }
    form.classList.add("was-validated");
  }
  else {
    submitReCaptchaForm(form, action);
  }

  evt.preventDefault();
  evt.stopPropagation();
}

function submitReCaptchaForm(form, action, callback) {
  let host = window.location.host;
  if (host.startsWith("staging-rcv123.") || host.startsWith("localhost:")) {
    const button = $(":submit", $(form));
      if (button.length > 0) {
        const name = button.prop("name");
        const value = button.prop("value");
        if (name && value) {
          form.appendChild(createInputElement("hidden", name, value));
        }
      }
      form.submit();

      if (callback) {
        callback();
      }
      return;
  }
  grecaptcha.enterprise.execute(RCKey, {action: action})
    .then(token => {
      // send along the submit button's name/value
      const button = $(":submit", $(form));
      if (button.length > 0) {
        const name = button.prop("name");
        const value = button.prop("value");
        if (name && value) {
          form.appendChild(createInputElement("hidden", name, value));
        }
      }

      const rcToken = createInputElement("hidden", "rcToken", token);
      form.appendChild(rcToken);
      form.submit();

      if (callback) {
        callback();
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function createInputElement(type, name, value) {
  const element = document.createElement("input");
  element.type = type;
  element.name = name;
  element.value = value;
  return element;
}

// Set input cursor position
$.fn.setCursorPosition = function(pos) {
  this.each(function(index, elem) {
    // Modern Browser
    if (elem.setSelectionRange) {
      elem.setSelectionRange(pos, pos);
    }
    // IE8 and below
    else if (elem.createTextRange) {
      const range = elem.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  });
  return this;
};

function revealElement(id) {
  const sel = $(`#${id}`);
  sel.fadeIn("slow");
  $([document.documentElement, document.body]).animate({
    scrollTop: sel.offset().top
  }, 1000);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Stripe
function getStripe() {
  const stripLive = Stripe('pk_live_51HViLfEmeUWzhFhiUbag5X5NuwkkSF0h5YKkjBiiWXJ2Aes0bOAiEYHbZBjhcsvXDZkvHifEpnOgyqR8Q83tRBrw00m9TpSvcS');
  const stripeTest = Stripe('pk_test_51HViLfEmeUWzhFhiesYly5ixI2qQDuXnDrZdhXbcTOxCRwf5bst2mMzY1nqrxUGX0bEQkkmuE15ZcaIM1Eip3fUq00cIWnt5G2');
  return location.hostname.endsWith("rcv123.org") ? stripLive : stripeTest;
}

function setupStripe() {
  // Stripe element integration
  const card = elements.create('card', {
    style: {
      base: {
        "fontSize": '20px',
      },
    },
  });
  card.on('change', function(event) {
    const sel = $('#card-element');
    sel.removeClass("is-invalid");
    $("#card-errors").text("");
    if (event.error) {
      sel.addClass("is-invalid");
      $("#card-errors").text(event.error.message);
    }
  });
  card.mount('#card-element');
  return card;
}

function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function validateCard() {
  const sel = $('#card-element');
  const classList = sel.attr('class').split(/\s+/);
  sel.removeClass("is-invalid");
  $("#card-errors").text("");
  if (!classList.includes('StripeElement--complete')) {
    $("#card-errors").text("Your card information is incomplete.");
    sel.addClass("is-invalid");
    return false;
  }
  return true;
}

function setupClipboard() {
  const clipboard = new ClipboardJS(".clipboard");
  clipboard.on('success', function(e) {
    const sel = $(e.trigger).closest(`.input-group`);
    // Get tippy instance
    const tippy = sel.get(0)._tippy;
    tippy.show();
    setTimeout(_ => tippy.hide(), 1000);
  });
}

function first(n, value) {
  const val = value || "";
  const count = Math.min(val.length, n);
  return val.substring(0, count);
}

function last(n, value) {
  const val = value || "";
  const count = Math.min(val.length, n);
  return val.substring(val.length - count);
}

function getCurrencyFormatter() {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
}

function getParameters() {
    let result = {};
    let params = document.location.search;
    if (params.length < 2) {
        return result;
    }
    params = params.substring(1).split("&"); // skip leading ?
    for (let p of params) {
        k = p.indexOf('=');
        if (k >= 0) {
            result[p.substring(0, k)] = p.substring(k + 1);
        } else {
            result[p] = p;
        }
    }
    return result;
}

function getStyles() {
    // Pulls the style parameter from this request and returns it as an object.
    // [Server-side version in common/utils]
    let styles = {};
    let styleParam = getParameters()['style'];
    if (!styleParam) {
        return styles;
    }
    for (const t of styleParam.split(']')) {
        k = t.indexOf('[');
        if (k >= 0) {
            styles[t.substring(0, k)] = t.substring(k + 1);
        }
    }
    return styles;
};

/**
 * Simple toggling expando.
 * 
 * To use:
 *     a.toggle.text-nowrap(data-toggle='#ITEM' data-toggle-group='.GROUP') LABEL
 *       i(class="fas fa-chevron-down" style="padding-left:0.25em")
 *     div#ITEM.GROUP.collapse
 *       CONTENT TO BE SHOWN WHEN CLICKING THE TOGGLE.
 *       WHEN ONE ITEM IN A GROUP IS SHOWN, THE OTHERS IN THAT GROUP ARE HIDDEN.
 * If you have multiple toggle buttons in a row, add style='margin-right: 24px' to 
 * all but the last one.
 * 
 * Add $(() => {initToggles();}) to the page if it's not already there. 
 */
function initToggles() {
  $('.toggle').on('click', (event) => {
      let element = $(event.target);
      let toggle = element.attr('data-toggle');
      let group = element.attr('data-toggle-group');
      // Hide anything that's opened for this group and turn off the toggle button.
      $(group + ':not(' + toggle + ')').hide();
      $('.toggle' + '[data-toggle-group="' + group + '"]' + '[data-toggle!="' + toggle + '"]').children('.fa-chevron-up')
          .removeClass('fa-chevron-up').addClass('fa-chevron-down');

      $(toggle).toggle();
      $(element).children('.fa-chevron-down,.fa-chevron-up').toggleClass('fa-chevron-down fa-chevron-up');
     });
};

// On load
$(() => {
  // Make all input(type="number") behave same as maxlength
  $('input[type=number][max]:not([max=""])').on('input', function (ev) {
    const sel = $(this);
    const maxlength = sel.attr('max').length;
    const value = sel.val();
    if (value && value.length >= maxlength) {
      sel.val(value.substring(0, maxlength));
    }
  });

  // Reload the page on back button click
  $(window).bind("pageshow", function(event) {
    let reload = event.originalEvent.persisted;
    const entries = performance.getEntriesByType("navigation");
    if (entries.length > 0) {
      reload = reload || entries[0].type === "back_forward";
    }
    if (reload) {
      window.location.reload()
    }
  });

});

