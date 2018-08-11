const { keys, reduce, toPairs, merge, omit, assoc, map, uniq, filter, not, isEmpty } = require('ramda');

module.exports = (nestedKeys, data) => {
  var output = [];

  data.forEach(obj => {
    var newObj = obj;
  
    nestedKeys.forEach(k => {
      const kArr = reduce((acc, val) => {
        if (val[0] && (val[0].search(k) > -1)) {
          return acc = merge(acc, {[val[0]]: val[1]});
        } else {
          return acc;
        }
      }, {}, toPairs(obj));
      //console.log('kArr',kArr);
    
      newObj = omit(keys(kArr), newObj);
      //console.log('newObj',newObj);
      
      const kObj = reduce((acc, val) => {
        const keyName = val[0].replace(k + '_','');
        return acc = merge(acc, {[keyName]: val[1]});
      }, {}, toPairs(kArr));
      //console.log('kObj',kObj);

      var kOut = assoc(k, [], {}); 
      
      const value = (kObj['id']) ? kObj['id'] : 'null';
      const valueArr = value.toString().split('**');
      if (valueArr.length > 0) {
        for (var i = 0; i < valueArr.length; i++) {
            //const kId = (i == 0 && valueArr[0] != 'null');
            var vOut = map((x) => {
              var cVal = (x) ? x.toString().split('**')[i] : null;
              if (not(isNaN(cVal)) && cVal != 'null' && cVal != null) { 
                cVal = Number(cVal); 
              }
              return (cVal == 'null') ? null : cVal; 
            }, kObj);
            kOut[k].push(vOut);
        }
        kOut[k] = uniq(kOut[k]);
      } else {
        kOut[k].push(kObj);
      }
      //console.log('kOut[k]',kOut[k]);

      kOut[k] = filter((x => x.id !== null), kOut[k]); 
      //console.log('kOut[k]',kOut[k]);

      newObj = merge(newObj, kOut);
      //console.log('newObj',newObj);
    });  

    output.push(newObj);   
  });

  //console.log('output',output);
  return output;
}
