var Options = function(values){
    values = values || {};
    this.values = values;
    this.html = null;
    this.account = null;
    
    this.onCallbacks = {}; //update
};

Options.accountsData = null;

Options.prototype.on = function(name, cb){
    if(!this.onCallbacks[name]) this.onCallbacks[name] = [];
    this.onCallbacks[name].push(cb);
};
Options.prototype.trigger = function(name){
    if(!this.onCallbacks[name]) return;
    this.onCallbacks[name].forEach(function(cb){
        cb();
    });
};

Options.load = function(account){
    var dfd = new $.Deferred();
    var options = new Options();
    
    chrome.storage.sync.get({
        accounts: {},
    }, function (accountsOptions) {
        var accounts = accountsOptions.accounts;
        var accountOptions = accounts[account];
        Options.accountsData = accountsOptions;
        options.account = account;
        
        if(accountOptions){
            options.setValues(accountOptions);
        }
    });
    return options;
};

Options.prototype.setValues = function(values){
    this.values = values;
    this.trigger('update');
};

Options.prototype.getValues = function(){
    return this.values;
};

Options.prototype.loadOptionsFromHtml = function(){
    var defaults = {};
    this.htmlElement.find(':input:not([type=submit])').each(function(){
        var id = $(this).attr('id');
        var val = $(this).val();
        defaults[id] = val;
    });
    this.values = defaults;
};
Options.prototype.fillOptionsInHtml = function(){
    var values = this.values;
    this.htmlElement.find(':input:not([type=submit])').each(function(){
        var id = $(this).attr('id');
        $(this).val(values[id]);
    });
};

Options.prototype.addHtmlBefore = function(element){
    
    var tplFile = chrome.extension.getURL("/src/content/options.html");
    var self = this;
    if(self.htmlElement){
        self.htmlElement.remove();
    }
    $.get(tplFile, function(html){
        self.htmlElement = $(html);
        
        self.fillOptionsInHtml();
        element.before(self.htmlElement);
        
        self.htmlElement.find('#saveAddCalc').click(function(evt){
            evt.preventDefault();
            self.loadOptionsFromHtml();
            self.save();
        });
    });
};

Options.prototype.save = function(){
    var self = this;
    var accD = Options.accountsData;
    accD['accounts'][this.account] = this.values;
    
    chrome.storage.sync.set(accD, function () {
        self.trigger('update');
        self.fillOptionsInHtml();
    });
};