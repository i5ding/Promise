const pushAsyncFunction = require('./util/pushAsyncFunction');

class Promise{
  constructor(execution){
    // if(new.target === undefined){
    //   throw new TypeError('Promise is a constructor, must be called with new');
    // }
    if(typeof execution !== "function"){
      throw new TypeError(`${execution} is not a function`);
    }
    
    this.state = 'pending';
    this.result = undefined;
    this.resolvedCallbackQueue = [];
    this.rejectedCallbackQueue = [];

    const resolve = (value)=>{
      if(this.state === 'pending'){
        if(value instanceof Promise){
          value.then((value)=>{
            this.state = 'resolved';
            this.result = value;
            for(let resolvedCallback of this.resolvedCallbackQueue){
              pushAsyncFunction(resolvedCallback, value);
            }
            this.resolvedCallbackQueue = [];
          }, (reason)=>{
            this.state = 'rejected';
            this.result = reason;
            for(let rejectedCallback of this.rejectedCallbackQueue){
              pushAsyncFunction(rejectedCallback, reason);
            }
            this.rejectedCallbackQueue = [];
          })
        }else{
          this.state = 'resolved';
          this.result = value;
          for(let resolvedCallback of this.resolvedCallbackQueue){
            pushAsyncFunction(resolvedCallback, value);
          }
          this.resolvedCallbackQueue = [];
        }
      }
    }
    const reject = (reason)=>{
      if(this.state === 'pending'){
        this.state = 'rejected';
        this.result = reason;
        for(let rejectedCallback of this.rejectedCallbackQueue){
          pushAsyncFunction(rejectedCallback, reason)
        }
        this.rejectedCallbackQueue = [];
      }
    }

    try {
      execution(resolve, reject);
    } catch (error) {
      reject(e);
    }
  }

  then(resolvedCallback, rejectedCallback){
    typeof resolvedCallback === "function" || (resolvedCallback = (value)=>{return value;});
    typeof rejectedCallback === "function" || (rejectedCallback = (reason)=>{throw reason;});
    return new Promise((resolve, reject)=>{
      resolvedCallback = this._wrapCallback(resolvedCallback, resolve, reject);
      rejectedCallback = this._wrapCallback(rejectedCallback, resolve, reject);
      switch(this.state){
        case 'pending':
          this.resolvedCallbackQueue.push(resolvedCallback);
          this.rejectedCallbackQueue.push(rejectedCallback);
          break;
        case 'resolved':
          pushAsyncFunction(resolvedCallback, this.result);
          break;
        case 'rejected':
          pushAsyncFunction(rejectedCallback, this.result);
          break;
      }
    })
  }

  catch(rejectedCallback){
    return this.then(null, rejectedCallback);
  }

  _wrapCallback(callback, resolve, reject){
    return (...args)=>{
      let result;
      try {
        result = callback(args[0]);
      } catch (error) {
        return reject(error);
      }
      resolve(result);
    }
  }

  static resolve(value){
    if(value instanceof this){

    }else{
      return new Promise((resolve)=>{
        resolve(value);
      });
    }
  }

  static reject(reason){
    return new Promise((resolve, reject)=>{
      reject(reason);
    });
  }

  static all(){

  }

  static race(){
    
  }
}

module.exports = Promise;