

//  the data comming like this : price is : 500 dynamic 
// the percentage is : 30 is percentage need to convert for calculation 0.3

// const { loadConfig } = require("tsconfig-paths");

// console.log(new Date("2024-12-31").getTime() ,'checking date time');
// console.log(new Date("null").getTime() > 0 ,'checking date time null');
// console.log(new Date(null).getTime() ,'checking date time empty');
// console.log(new Date("").getTime() ,'checking date time empty string');
// console.log(new Date(undefined).getTime() ,'checking date time undefined');
// console.log(typeof null ,'checking type of null');
// console.log(typeof undefined ,'checking type of undefined');
// console.log(typeof "" ,'checking type of empty string');
// console.log(new Date(parseFloat("null")).getTime() ,'checking date time parseInt null');

// console.log( null < 0 ,'checking null less than zero');
// console.log( null <= 0 ,'checking null less than or equal to zero');
// console.log( );



// console.log(object);




// console.log([] == [],'checking array comparison');
// console.log(undefined == undefined,'checking undefined comparison');
// console.log(null == null,'checking null comparison');
// console.log({} == {} ,'checking object comparison');
// console.log(NaN === NaN ,'checking NaN comparison');
// console.log(typeof NaN ,'checking type of NaN');
// console.log("" == "" ,'checking empty string comparison');
// console.log(0 == 0 ,'checking zero comparison');


// function buildNestedWhere(path, searchTerm) {
//   const keys = path.split("."); // e.g. ["customer", "business", "company", "fullName"]
//   const lastKey = keys.pop();   // take last field (fullName)

//   // innermost condition
//   let condition = {
//     [lastKey]: { contains: searchTerm, mode: "insensitive" }
//   };

//   // wrap from inside out
//   for (let i = keys.length - 1; i >= 0; i--) {
//     condition = { [keys[i]]: condition };
//   }

//   return condition;
// }

// function search(prismaQuery, query, searchableFields) {
//   const searchTerm = query.searchTerm;

//   if (searchTerm) {
//     const orConditions = searchableFields.map((field) => {
//       if (field.includes(".")) {
//         // nested search
//         return buildNestedWhere(field, searchTerm);
//       } else {
//         // flat search
//         return { [field]: { contains: searchTerm, mode: "insensitive" } };
//       }
//     });

//     prismaQuery.where = {
//       ...prismaQuery.where,
//       OR: orConditions,
//     };
//   }

//   return prismaQuery;
// }

// const prismaQuery ={
//     where:{}
// }

// const query = {
//     searchTerm: 'abc'
// }

// const searchableFields = ['customer.fullName','customer.business.company.fullName']

// console.log(search(prismaQuery, query, searchableFields),'checking searching branch update');


// const value = "customer.business.company.fullName".split(".");
// const searcingValue  = {

// }

// const fakeObject = {
//   layer1_1: 23,
//   layer1_2: 234,
//   layer1_3: {
//     layer2_1: 234,
//     layer2_2: 234,
//     layer2_3: {
//       layer3_1: 234,
//       layer3_2: 234,
//       layer3_3: null,
//       layer3_4: {
//         layer4_1: 234,
//         layer4_2: 234,
//         layer4_3: 234,
//         layer4_4: 234,
//         layer4_5: {
//           layer5_1: 234,
//           layer5_2: 234,
//           layer5_3: null,
//           layer5_4: {
//             layer6_1: 234,
//             layer6_2: 234,
//             layer6_3: 234,
//             layer6_4: 234,
//             layer6_5: null,
//             layer6_6: {
//               layer7_1: 234,
//               layer7_2: 234,
//               layer7_3: 234,
//               layer7_4: 234
//             }
//           }
//         },
//         layer4_6: {
//           layer5_1: 234,
//           layer5_2: 234,
//           layer5_4: {
//             layer6_1: 234,
//             layer6_2: 234,
//             layer6_3: 234,
//             layer6_4: 234,
//             layer6_5: null,
//             layer6_6: {
//               layer7_1: 234,
//               layer7_2: 234,
//               layer7_3: 234,
//               layer7_4: 234
//             }
//           }
//         }
//       }
//     }
//   }
// };

// outPutExample =  {
//   layer1_1: 23,
//   layer1_2: 234,
//   layer1_3: {
//     layer2_1: 234,
//     layer2_2: 234,
//       layer3_4: {
//         layer4_1: 234,
//         layer4_2: 234,
//         layer4_3: 234,
//         layer4_4: 234,
//         layer6_6: {
//               layer7_1: 234,
//               layer7_2: 234,
//               layer7_3: 234,
//               layer7_4: 234
//             },
//         layer4_6: {
//           layer5_1: 234,
//           layer5_2: 234,
//             layer6_6: {
//               layer7_1: 234,
//               layer7_2: 234,
//               layer7_3: 234,
//               layer7_4: 234
//             }
//           }
//         }
//   }
// };


// /**
//  * ---------------------------------------------------------------
//  * @param {*} Number 
//  * @returns 
//  * return the stack call back function
//  * each function call will be stored in the stack
//  * ----------------------------------------------------------------
//  */

// function CheckingStack(Number){
//         if(Number < 0){
//           return 0
//         }
//         const value =  CheckingStack(Number -1)
//         console.log(Number,'checking stack number');
//         console.log(value,"stack Relase the value here =====>", );
//         return value + Number
// }
// CheckingStack(7);

//  output should be like this
// console.log(Number.toString(345),'checking epsilon --------->');
// console.log( (34.5543 / Number.EPSILON) * Number.EPSILON ,'checking epsilon --------->');
// console.log( Math.round((34.5543 + Number.EPSILON) * 100) / 100 ,'checking epsilon --------->');
// console.log( Math.round((34.5555 + Number.EPSILON) * 100) / 100 ,'checking epsilon --------->');
// console.log(Number.EPSILON,'checking Epslion =-====================>');
// console.log(2.220446049250313 * 10 ^ (-16),'checking multiplay-------------->');

// console.log(0.0000165 * 10000000 ,'checking small number multiplaction');
// console.log(234.566234234.toFixed(2));
// console.log(234.23423423.toFixed(2));

// let isNumber = 1000; 
// if(isNumber > 100){
//     console.log("if iniziliza this block excution perfaclty ==============>");
// }else if(isNumber > 100){
//     console.log("else if blog excution perfaclty ===============>");
// }else {
//     console.log("Last block is excution perfactly ========>");
// }

// if(isNumber > 500){
//     console.log("Second if block excution perfaclty ==============>");
// }

// ===========================
// switch case statement
// ===========================
// let IsNumberIs = 2000;
// switch(IsNumberIs){
//     case 1000:
//         console.log("case 1000 excution perfaclty ==============>");
//         break;
//     case 2000:
//         console.log("case 2000 excution perfaclty ==============>");
//         break;
//     case 3000:
//         console.log("case 3000 excution perfaclty ==============>");
//         break;
//     case 3000:
//         console.log("case 3000 excution perfaclty ==============>");
//         break;
//     default:
//         console.log("default case excution perfaclty ==============>");
// }

// =================================
// for loop with continue statement
// =================================
// let NumberOfArray = [100,200,300,400,500];
// for(let i =0; i< NumberOfArray.length; i++){
//         if(NumberOfArray[i] === 300){
//             console.log("found the matching value in array ==============>");
//             continue;
//         }
//     console.log(NumberOfArray[i],'checking array value in for loop ==============>');
// }

// ===============================
// while and do while loop
// // ============================

// let count =56;
// do{
//     console.log(count,'checking do while loop excution ==============>');
// }while(count > 0);

// let count =30;
// while(count > 0){
//     continue;
//         console.log('checking while loop excution ==============>');
//     continue;
// }












