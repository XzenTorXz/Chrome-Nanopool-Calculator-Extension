$(function () {    
       
    var path = window.location.pathname;
    var pathSplit = path.split('/');
    var account = pathSplit[2];
    var table = $('[data-bind="with: calc"]');
    
    var options = Options.load(account);
    options.addHtmlBefore(table);
    
    $(table.find('tr:last td:last')).on('DOMSubtreeModified', function(e){
        options.trigger('update');
    });
    
    options.on('update', function(){
        var optionsValues = options.getValues();
        $('.addCalc').remove();
        
        if(optionsValues.consumption && optionsValues.price){
            var watt = optionsValues.consumption;
            var kWPrice = optionsValues.price;
            var curencyCol = 3;
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
                        return parseFloat(row[curencyCol]) - powerPrice(timeInHours);
                    })
                },
                {
                    'title': 'equ. buy price ['+curencyName+']',
                    'calc': timeInHourWrapper(function (row, timeInHours) {
                        var coin = parseFloat(row[coinCol]);
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