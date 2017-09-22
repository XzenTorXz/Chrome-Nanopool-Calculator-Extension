


$(function () {    
    
    $.fn.addCalculatedCols = function (colOptions) {
        var rowIndex = 0;

        $(this).find('tr').each(function () {
            var tr = $(this);
            var row = [];
            var tdTh = rowIndex == 0 ? 'th' : 'td';

            tr.find(tdTh).each(function () {
                row.push($(this).text());
            });

            var colIndex = 0;
            for (var index in colOptions) {
                var col = colOptions[index];
                var title = col.title;
                var calc = col.calc;
                var add = col.add;
                var value = rowIndex == 0 ? title : parseFloat(calc(row, rowIndex)).toFixed(2)

                var newTd = $('<td>')
                    .addClass('addCalc')
                    .addClass('text-right')
                    .html(value)
                ;

                tr.append(newTd);
                if(add){
                    add(newTd, value);
                }
                colIndex++;
            }

            rowIndex++;
        });
    };
    
    var path = window.location.pathname;
    var pathSplit = path.split('/');
    var account = pathSplit[2];
    var table = $('[data-bind="with: calc"]');
    
    
    var options = Options.load(account);
    options.addHtmlBefore(table);
    
    table.change(function(){
        options.trigger('update');
    });
    
    options.on('update', function(){
        var optionsValues = options.getValues();
        $('.addCalc').remove();
        
        if(optionsValues.consumption && optionsValues.price && optionsValues.curency){
            var watt = optionsValues.consumption;
            var kWPrice = optionsValues.price;
            var curencyCol = optionsValues.curency;
            var coinCol = 1;
            
            var tableHead = [];
            table.find('th').each(function(){
               tableHead.push($(this).text()); 
            });

            var curencyName = tableHead[curencyCol];
            
            var timePerRowInHour = [
                1 / 60,
                1,
                24,
                24 * 7,
                24 * 31,
            ];

            var powerPrice = function (timeInHours) {
                return watt / 1000 * timeInHours * kWPrice;
            };
            
            var timeInHourWrapper = function(calcFunction){
                return function(row, rowIndex){
                    var timeInHours = timePerRowInHour[rowIndex - 1];
                    return calcFunction(row, timeInHours, rowIndex);
                };
            };

            var addCols = [
                {
                    'title': 'Power cost ['+curencyName+']',
                    'calc': timeInHourWrapper(function (row, timeInHours) {
                        return powerPrice(timeInHours);
                    })
                },
                {
                    'title': 'Gains ['+curencyName+']',
                    'add': function(td, value){
                        if(value > 0 || value < 0){
                            td.addClass(value > 0 ? 'gain' : 'loose');
                        }
                    },
                    'calc': timeInHourWrapper(function (row, timeInHours) {
                        return row[curencyCol] - powerPrice(timeInHours);
                    })
                },
                {
                    'title': 'equ. buy price ['+curencyName+']',
                    'calc': timeInHourWrapper(function (row, timeInHours) {
                        var coin = row[coinCol];
                        if (coin == 0){
                            return 0;
                        }
                        return 1 / coin * powerPrice(timeInHours);
                    })
                },
            ];
            
            table.addCalculatedCols(addCols);
        }
    });
});