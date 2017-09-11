

!function ($) {

    "use strict";


    class MultiSelect {

        constructor(select, options) {
            this.$originalSelect = $(select);
            this.options = options;

            this.$newSelect = $('<div/>', {'class': "new_select"});
            this.$selectableContainer = $('<div/>', {'class': 'SELECT-selectable'});
            this.$selectionContainer = $('<div/>', {'class': 'SELECT-selection'});
            this.$selectableUl = $('<ul/>', {'class': "SELECT-list", 'tabindex': '-1'});
            this.$selectionUl = $('<ul/>', {'class': "SELECT-list", 'tabindex': '-1'});
            this.scrollTo = 0;
            this.elemsSelector = 'li:visible:not(.SELECT-optgroup-label,.SELECT-optgroup-container,.' + options.disabledClass + ')';

        }

        //core de start
        init() {
            if (this.$originalSelect.next('.new_select').length === 0) { // is new select
                this.create_new_select();
                this.activeEvent();
            }
            // les options qui select ou start   
            var selectedValues = this.$originalSelect.find('option:selected').map(function () {
                return $(this).val();
            }).get();
            this.marginItem(selectedValues);
            this.afterInit();
        }

        create_new_select() {

            // cache elment select original   
            //SELECT.css({position: 'absolute', top: '10px'});

            // copier les attribus de select original a select new 
            // attr id 
            if (this.$originalSelect.attr('id') == undefined) {
                this.$originalSelect.attr('id', Math.ceil(Math.random() * 1000) + '_ID_Random')
            }
            // copier ID original plus prefix newSelect et jouter class si il y a en options
            this.$newSelect.attr('id', 'newSelect-' + this.$originalSelect.attr('id'))
                    .addClass(this.options.cssClass);

            // generateLisFromOption par les optino de select
            this.$originalSelect.find('option').each((index, option) => {
                // copier les options de selectOriginale et coller dans
                //  block selectableLi,selectedLi avec hide() block selectedLi

                this.generateLisFromOption(option);  // option de select  initiale de select 

            });

            this.$selectionUl.find('.SELECT-optgroup-label').hide();

            //generateHeaderContainerFooter
            this.generateHeaderContainerFooter();


            // ajouter newselect en HTML apres original select
            this.$originalSelect.after(this.$newSelect);

        }

                generateLisFromOption(option, index, $newSelect) {
                    // copier les options de selectOriginale et coller dans
                    //  block selectableLi,selectedLi avec hide() block selectedLi



                    let attributes = "", $option = $(option);

                    // copier des attribute de original a newselect  <option style="color:red" ...>elem 1</option>
                    let attr = option.attributes;
                    for (let i = 0; i < attr.length; i++) {
                        if (attr[i].name !== 'value' && attr[i].name !== 'disabled') {
                            attributes += attr[i].name + '="' + attr[i].value + '" ';
                        }
                    }
                    // copier text et value de option
                    let text = $option.text();
                    let value = $option.val();

                    // crier deux bloc selectableLi et selectedLi avec element {li span}
                    let selectableLi = $('<li ' + attributes + '><span>' + this.escapeHTML(text) + '</span></li>');
                    let selectedLi = selectableLi.clone();

                    // creier de id par value (nombr)
                    let elementId = this.sanitize(value);



                    selectableLi
                            .data('SELECT-value', value)            //insert data jquery pour event click
                            .addClass('SELECT-elem-selectable')     // insert class de style css externt
                            .attr('id', elementId + '-selectable'); // insert id 

                    selectedLi
                            .data('SELECT-value', value)            //insert data jquery pour event click
                            .addClass('SELECT-elem-selection')      // insert class de style css externt
                            .attr('id', elementId + '-selection')   // insert id
                            .hide();                                // caher element li


                    // s il y a attr disabled dans $originalSelect ou $option
                    if ($option.prop('disabled') || this.$originalSelect.prop('disabled')) {
                        selectedLi.addClass(this.options.disabledClass);
                        selectableLi.addClass(this.options.disabledClass);
                    }


                    // index de li pour ajouter en block
                    if (index === undefined) {
                        index = this.$selectableUl.children().length
                    }


                    //ajouter des li on block selectableLi,selectedLi
                    selectableLi.insertAt(index, this.$selectableUl);
                    selectedLi.insertAt(index, this.$selectionUl);

                }

                generateHeaderContainerFooter() {
                    if (this.options.selectableHeader) {
                        this.$selectableContainer.append(this.options.selectableHeader);
                    }
                    this.$selectableContainer.append(this.$selectableUl);
                    if (this.options.selectableFooter) {
                        this.$selectableContainer.append(this.options.selectableFooter);
                    }

                    if (this.options.selectionHeader) {
                        this.$selectionContainer.append(this.options.selectionHeader);
                    }
                    this.$selectionContainer.append(this.$selectionUl);

                    if (this.options.selectionFooter) {
                        this.$selectionContainer.append(this.options.selectionFooter);
                    }

                    this.$newSelect.append(this.$selectableContainer);
                    this.$newSelect.append(this.$selectionContainer);
                }

        //event list

        activeEvent() {
            this.activeMouse();
            this.activeKeyboard();
            this.activeClick();
            this.activeFocus();


        }
                //  call function select() or deselect()
                activeClick() {
                    var $_this = this;
                    var action = this.options.dblClick ? 'dblclick' : 'click';

                    this.$selectableUl.on(action, '.SELECT-elem-selectable', function () {
                        $_this.select($(this).data('SELECT-value'));
                    });
                    this.$selectionUl.on(action, '.SELECT-elem-selection', function () {
                        $_this.deselect($(this).data('SELECT-value'));
                    });

                }
                // add class css SELECT-hover par mouse move
                activeMouse() {
                    var elemsSelector = this.elemsSelector;

                    this.$newSelect.on('mouseenter', elemsSelector, function () {
                        $(this).parents('.new_select').find(elemsSelector).removeClass('SELECT-hover');
                        $(this).addClass('SELECT-hover');
                    });

                    this.$newSelect.on('mouseleave', elemsSelector, function () {
                        $(this).parents('.new_select').find(elemsSelector).removeClass('SELECT-hover');
                    });
                }
                //change focus originalselect a new
                 activeFocus() {
                    var $_this = this;
                    this.$originalSelect.on('focus', function () {
                        $_this.$selectableUl.focus();
                    });
                }
                activeKeyboard() {
                    var $_this = this;

                    this.$selectionUl.on('focus', function () {
                        $(this).addClass('SELECT-focus');
                    })
                            .on('blur', function () {
                                $(this).removeClass('SELECT-focus');
                            })
                            .on('keydown', function (e) {
                                switch (e.which) {
                                    case 40:
                                    case 38:
                                        e.preventDefault();
                                        e.stopPropagation();
                                        $_this.moveHighlight($(this), (e.which === 38) ? -1 : 1);
                                        return;
                                    case 37:
                                    case 39:
                                        e.preventDefault();
                                        e.stopPropagation();
                                        $_this.switchList($_this.$selectionUl);
                                        return;
                                    case 9:
                                        if ($_this.$originalSelect.is('[tabindex]')) {
                                            e.preventDefault();
                                            var tabindex = parseInt($_this.$originalSelect.attr('tabindex'), 10);
                                            tabindex = (e.shiftKey) ? tabindex - 1 : tabindex + 1;
                                            $('[tabindex="' + (tabindex) + '"]').focus();
                                            return;
                                        } else {
                                            if (e.shiftKey) {
                                                $_this.$originalSelect.trigger('focus');
                                            }
                                        }
                                }
                                if ($.inArray(e.which, $_this.options.keySelect) > -1) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    $_this.selectHighlighted($_this.$selectionUl);
                                    return;
                                }
                            });

                    this.$selectableUl.on('focus', function () {
                        $(this).addClass('SELECT-focus');
                    })
                            .on('blur', function () {
                                $(this).removeClass('SELECT-focus');
                            })
                            .on('keydown', function (e) {
                                switch (e.which) {
                                    case 40:
                                    case 38:
                                        e.preventDefault();
                                        e.stopPropagation();
                                        $_this.moveHighlight($(this), (e.which === 38) ? -1 : 1);
                                        return;
                                    case 37:
                                    case 39:
                                        e.preventDefault();
                                        e.stopPropagation();
                                        $_this.switchList($_this.$selectableUl);
                                        return;
                                    case 9:
                                        if ($_this.$originalSelect.is('[tabindex]')) {
                                            e.preventDefault();
                                            var tabindex = parseInt($_this.$originalSelect.attr('tabindex'), 10);
                                            tabindex = (e.shiftKey) ? tabindex - 1 : tabindex + 1;
                                            $('[tabindex="' + (tabindex) + '"]').focus();
                                            return;
                                        } else {
                                            if (e.shiftKey) {
                                                $_this.$originalSelect.trigger('focus');
                                            }
                                        }
                                }
                                if ($.inArray(e.which, $_this.options.keySelect) > -1) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    $_this.selectHighlighted($_this.$selectableUl);
                                    return;
                                }
                            });
                }
                            moveHighlight($list, direction) {
            var $elems = $list.find(this.elemsSelector),
                    $currElem = $elems.filter('.SELECT-hover'),
                    $nextElem = null,
                    elemHeight = $elems.first().outerHeight(),
                    containerHeight = $list.height(),
                    containerSelector = '#' + this.$newSelect.prop('id');

            $elems.removeClass('SELECT-hover');
            if (direction === 1) { // DOWN

                $nextElem = $currElem.nextAll(this.elemsSelector).first();
                if ($nextElem.length === 0) {
                    var $optgroupUl = $currElem.parent();

                    if ($optgroupUl.hasClass('SELECT-optgroup')) {
                        var $optgroupLi = $optgroupUl.parent(),
                                $nextOptgroupLi = $optgroupLi.next(':visible');

                        if ($nextOptgroupLi.length > 0) {
                            $nextElem = $nextOptgroupLi.find(this.elemsSelector).first();
                        } else {
                            $nextElem = $elems.first();
                        }
                    } else {
                        $nextElem = $elems.first();
                    }
                }
            } else if (direction === -1) { // UP

                $nextElem = $currElem.prevAll(this.elemsSelector).first();
                if ($nextElem.length === 0) {
                    var $optgroupUl = $currElem.parent();

                    if ($optgroupUl.hasClass('SELECT-optgroup')) {
                        var $optgroupLi = $optgroupUl.parent(),
                                $prevOptgroupLi = $optgroupLi.prev(':visible');

                        if ($prevOptgroupLi.length > 0) {
                            $nextElem = $prevOptgroupLi.find(this.elemsSelector).last();
                        } else {
                            $nextElem = $elems.last();
                        }
                    } else {
                        $nextElem = $elems.last();
                    }
                }
            }
            if ($nextElem.length > 0) {
                $nextElem.addClass('SELECT-hover');
                var scrollTo = $list.scrollTop() + $nextElem.position().top -
                        containerHeight / 2 + elemHeight / 2;

                $list.scrollTop(scrollTo);
            }
        }

                            selectHighlighted($list) {
                                var $elems = $list.find(this.elemsSelector),
                                        $highlightedElem = $elems.filter('.SELECT-hover').first();

                                if ($highlightedElem.length > 0) {
                                    if ($list.parent().hasClass('SELECT-selectable')) {
                                        this.select($highlightedElem.data('SELECT-value'));
                                    } else {
                                        this.deselect($highlightedElem.data('SELECT-value'));
                                    }
                                    $elems.removeClass('SELECT-hover');
                                }
                            }

                            switchList($list) {
                                $list.blur();
                                this.$newSelect.find(this.elemsSelector).removeClass('SELECT-hover');
                                if ($list.parent().hasClass('SELECT-selectable')) {
                                    this.$selectionUl.focus();
                                } else {
                                    this.$selectableUl.focus();
                                }
                            }
               

        //select et deselect dans newSelect
        marginItem(value) {
        
 
           let selectables  = this.object_item(value).selectables;
           let selections   = this.object_item(value).selections;
 
 
            if (selectables.length > 0) {

                selectables.addClass('OPTION-selected')
                        .hide();

                selections.addClass('OPTION-selected')
                        .show();

                this.object_item(value).options.prop('selected', true);  // active selected original select



            }
        }

        // navigation  entre deux block         

        select(value) {

           
           let selectables  = this.object_item(value).selectables;
           let selections   = this.object_item(value).selections;



            if (selectables.length > 0) {

                selectables.addClass('OPTION-selected')
                        .hide(1000);

                selections.addClass('OPTION-selected')
                        .show(1000);

                this.object_item(value).options.prop('selected', true);  // active selected original select

                // effacer class css SELECT-hover de cursur chaque changement
                this.$newSelect.find(this.elemsSelector).removeClass('SELECT-hover');




                if (this.options.keepOrder) { // order de position des item( asec or none)
                    var selectionLiLast = this.$selectionUl.find('.OPTION-selected');  //les elements non hide =>show
                    if ((selectionLiLast.length > 1) && (selectionLiLast.last().get(0) != selections.get(0))) {
                        selections.insertAfter(selectionLiLast.last());
                    }
                }


                this.$originalSelect.trigger('change');  // start onchange de element original
                this.afterSelect(value);

            }
        }

        deselect(value) {

           
           let selectables  = this.object_item(value).selectables;
           let selections   = this.object_item(value).selections.filter('.OPTION-selected');
           
           
           
            if (selections.length > 0) {
                selectables.
                        removeClass('OPTION-selected').
                        show(1000);
                selections.
                        removeClass('OPTION-selected').
                        hide(1000);
                this.object_item(value).options.prop('selected', false);  // disactive selected original select

                this.$newSelect.find(this.elemsSelector).removeClass('SELECT-hover');


                this.$originalSelect.trigger('change');
                this.afterDeselect(value);
            }
        }
        
        

        addOption(options) {
            var $_this = this;

            if (options.value !== undefined && options.value !== null) {
                options = [options];
            }
            $.each(options, function (index, option) {
                if (option.value !== undefined && option.value !== null &&
                        $_this.$originalSelect.find("option[value='" + option.value + "']").length === 0) {
                    var $option = $('<option value="' + option.value + '">' + option.text + '</option>'),
                            $newSelect = option.nested === undefined ? $_this.$originalSelect : $("optgroup[label='" + option.nested + "']"),
                            index = parseInt((typeof option.index === 'undefined' ? $newSelect.children().length : option.index));

                    if (option.optionClass) {
                        $option.addClass(option.optionClass);
                    }

                    if (option.disabled) {
                        $option.prop('disabled', true);
                    }

                    $option.insertAt(index, $newSelect);
                    $_this.generateLisFromOption($option.get(0), index, option.nested);
                }
            });
        }



        refresh() {
            this.destroy();
            this.$originalSelect.multiSelect(this.options);
        }

        destroy() {
            $("#SELECT-" + this.$originalSelect.attr("id")).remove();
            this.$originalSelect.off('focus');
            this.$originalSelect.css('position', '').css('left', '');
            this.$originalSelect.removeData('multiselect');
        }

        select_all() {
            var SELECT = this.$originalSelect,
                    values = SELECT.val();

            SELECT.find('option:not(":disabled")').prop('selected', true);
            this.$selectableUl.find('.SELECT-elem-selectable').filter(':not(.' + this.options.disabledClass + ')').addClass('OPTION-selected').hide();
            this.$selectionUl.find('.SELECT-optgroup-label').show();
            this.$selectableUl.find('.SELECT-optgroup-label').hide();
            this.$selectionUl.find('.SELECT-elem-selection').filter(':not(.' + this.options.disabledClass + ')').addClass('OPTION-selected').show();
            this.$selectionUl.focus();
            SELECT.trigger('change');
            if (typeof this.options.afterSelect === 'function') {
                var selectedValues = $.grep(SELECT.val(), function (item) {
                    return $.inArray(item, values) < 0;
                });
                this.options.afterSelect.call(this, selectedValues);
            }
        }

        deselect_all() {
            var SELECT = this.$originalSelect,
                    values = SELECT.val();

            SELECT.find('option').prop('selected', false);
            this.$selectableUl.find('.SELECT-elem-selectable').removeClass('OPTION-selected').show();
            this.$selectionUl.find('.SELECT-optgroup-label').hide();
            this.$selectableUl.find('.SELECT-optgroup-label').show();
            this.$selectionUl.find('.SELECT-elem-selection').removeClass('OPTION-selected').hide();
            this.$selectableUl.focus();
            SELECT.trigger('change');
            if (typeof this.options.afterDeselect === 'function') {
                this.options.afterDeselect.call(this, values);
            }
        }

        //call function
        afterInit() {
            if (typeof this.options.afterInit === 'function') {
                this.options.afterInit.call(this, this.$newSelect);
            }
        }
        afterSelect(value) {
            if (typeof this.options.afterSelect === 'function') {
                this.options.afterSelect.call(this, value, this.$newSelect);
            }
        }
        afterDeselect(value) {
            if (typeof this.options.afterDeselect === 'function') {
                this.options.afterDeselect.call(this, value, this.$newSelect);
            }
        }
        //outils
        sanitize(value) {
            // string to nombre
            var hash = 0, ascii;
            if (value.length == 0)
                return 0;

            for (var i = 0; i < value.length; i++) {

                ascii = value.charCodeAt(i);
                hash = ((hash << 5) - hash) + ascii;
                hash |= 0; // Convert to 32bit integer
            }

            return hash;
        }
        escapeHTML(text) { /// <h1>awa</h1> to &lt;h1&gt;awa&lt;/h1&gt;
            return $("<div>").text(text).html();
        }
        sanitizeArry(value) {
            return $.map(value, (val) => {
                return(this.sanitize(val));
            })
        }
        object_item(value) {
            if (typeof value === 'string') {
                value = [value]
            }
            //item select en original selectad
            let       options = this.$originalSelect.find('option:not(:disabled)').filter(function () {
                             return($.inArray(this.value, value) > -1);
            });

            // [text] to [nomber ] array + object query            
            let       code = this.sanitizeArry(value);

            // array to string avec sufix et prefix ,    methode join() 
            let CssSelectable = '#' + code.join('-selectable, #') + '-selectable';
            let CssSelection = '#' + code.join('-selection, #') + '-selection';
            let   selectables = this.$selectableUl.find(CssSelectable);
            let   selections = this.$selectionUl.find(CssSelection);
            let disabled = this.options.disabledClass;
            selectables  = selectables.filter(':not(.' + disabled + ')');
            selections   = selections.filter(':not(.' + disabled + ')');
            return {"selectables": selectables, "selections": selections, "options": options}
        }

       }


    /* MULTISELECT PLUGIN DEFINITION
     * ======================= */

    $.fn.multiSelect = function (option, args) {


        return this.each(function () {
            var $this = $(this),
                    options = $.extend(
                            {},
                            {
                                keySelect: [32],
                                selectableOptgroup: false,
                                disabledClass: 'disabled',
                                dblClick: false,
                                keepOrder: true,
                                cssClass: ''
                            },
                            $this.data(),
                            typeof option === 'object' && option   //// console.log(false|true && 'wassim')
                            ),
                    OB_MultiSelect = $(this).data('multiselect');

            if (!OB_MultiSelect) {
                OB_MultiSelect = new MultiSelect(this, options)
                $(this).data('multiselect', (OB_MultiSelect))
            }

            if (typeof option === 'string') {
                OB_MultiSelect[option](args);
            } else {
                OB_MultiSelect.init();
            }
        });
    };



    

    $.fn.insertAt = function (index, $parent) {
        // ajouter des element option dans New select ul
        return this.each(function () {

            if (index === 0) {

                $parent.prepend(this);
            } else {

                $parent.children().eq(index - 1).after(this);
            }
        });
    };

}(window.jQuery);
