import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/app_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/submit_comment_provider.dart';
import 'package:highfedilityadevar/micheal_code/widgets/post_category_item.dart';

import 'colors..dart';
import 'confirm_bottom_sheet.dart';

class PostModalSheet extends StatefulWidget {
  @override
  State<PostModalSheet> createState() => _PostModalSheetState();
}

class _PostModalSheetState extends State<PostModalSheet> {
  bool buttonCheck = false;

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    return Consumer<AppProvider>(
      builder: (context, appPro, _) {
        return SingleChildScrollView(
          child: StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Container(
                padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewInsets.bottom),
                child: Container(
                  height: size.height * 0.6,
                  width: size.width,
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(30),
                          topRight: Radius.circular(30)),
                      color: Colors.white),
                  child: Stack(
                    children: [
                      Padding(
                        padding: EdgeInsets.only(
                            left: size.width * 0.06,
                            right: size.width * 0.06,
                            top: size.height * 0.01),
                        child: Column(
                          children: [
                            Container(
                              height: size.height * 0.008,
                              width: size.width * 0.35,
                              decoration: BoxDecoration(
                                  color: Color(0xffE3E3E3),
                                  borderRadius: BorderRadius.circular(10)),
                            ),
                            SizedBox(
                              height: size.height * 0.06,
                            ),
                            // FocusScope(
                            //   child: Focus(
                            //     onFocusChange: (focus) {
                            //       setState(() {
                            //         appPro.chkDialogue();
                            //       });
                            //     },
                            //     child:
                            GestureDetector(
                              onTap: () {
                                appPro.chkDialogue();
                              },
                              child: TextField(
                                controller: appPro.topicTitleController,
                                decoration: InputDecoration(
                                  filled: true,
                                  fillColor: Color(0xffF0F3F6),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(12.0)),
                                    borderSide: BorderSide(
                                        color: Color(0xffF0F3F6), width: 2),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(10.0)),
                                    borderSide: BorderSide(color: Colors.white),
                                  ),
                                  hintText: "Topic title",
                                  hintStyle:
                                      TextStyle(color: Color(0xffAEAEB2)),
                                  prefixIcon: Icon(
                                    Icons.edit,
                                    color: Colors.black,
                                  ),
                                ),
                                // ),
                                // ),
                              ),
                            ),
                            SizedBox(
                              height: size.height * 0.01,
                            ),
                            InkWell(
                              onTap: () {
                                // setState(() {
                                //   FocusScope.of(context).unfocus();
                                appPro.open();
                                // });
                              },
                              child: Container(
                                height: size.height * 0.08,
                                width: size.width,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  color: Color(0xffF0F3F6),
                                ),
                                child: Padding(
                                  padding:
                                      EdgeInsets.only(left: size.width * 0.02),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.add,
                                        color: Colors.black,
                                        size: 30,
                                      ),
                                      Text(
                                        appPro.category,
                                        style: TextStyle(
                                            fontSize: size.height * 0.02,
                                            color: appPro.category ==
                                                    "Choose Category"
                                                ? Color(0xffAEAEB2)
                                                : blueColor),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(
                              height: size.height * 0.01,
                            ),
                            // FocusScope(
                            //   child: Focus(
                            //     onFocusChange: (focus) {
                            //       setState(() {
                            //         appPro.chkDialogue();
                            //       });
                            //     },
                            //     child:
                            GestureDetector(
                              onTap: () {
                                appPro.chkDialogue();
                              },
                              child: TextField(
                                controller: appPro.detailsController,
                                maxLines: 6,
                                decoration: InputDecoration(
                                  filled: true,
                                  fillColor: Color(0xffF0F3F6),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(12.0)),
                                    borderSide: BorderSide(
                                        color: Color(0xffF0F3F6), width: 2),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(10.0)),
                                    borderSide: BorderSide(color: Colors.white),
                                  ),
                                  hintText: "Write Details....",
                                  hintStyle:
                                      TextStyle(color: Color(0xffAEAEB2)),
                                ),
                              ),
                            ),
                            // ),
                            // ),
                            SizedBox(
                              height: size.height * 0.04,
                            ),
                            GestureDetector(
                              onTap: () {
                                // appPro.open();
                                // appPro.category != "Choose Category"
                                //     ? Navigator.pop(context)
                                //     : null;
                                // appPro.category != "Choose Category"
                                //     ? showModalBottomSheet(
                                //         backgroundColor: Colors.transparent,
                                //         shape: RoundedRectangleBorder(
                                //           borderRadius: BorderRadius.circular(
                                //               size.height * 0.06),
                                //         ),
                                //         context: context,
                                //         builder: (context) {
                                //           return confirmBottomSheet(
                                //             context,
                                //             '1',
                                //           );
                                //         })
                                //     : null;
                                if (appPro.category != "Choose Category") {
                                  Provider.of<SubmitCommentProvider>(context,
                                          listen: false)
                                      .submitComment(
                                    context: context,
                                    title: appPro.topicTitleController.text,
                                    category: appPro.category,
                                    details: appPro.detailsController.text,
                                  );
                                  appPro.resetTextFields();
                                } else {
                                  print('Fields cannot be empty');
                                }
                              },
                              child: Container(
                                height: size.height * 0.07,
                                width: size.width,
                                decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(15),
                                    color: appPro.category != "Choose Category"
                                        ? blueColor
                                        : Colors.grey),
                                child: Center(
                                  child: Text(
                                    "Submit",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: size.height * 0.02,
                                    ),
                                  ),
                                ),
                              ),
                            )
                          ],
                        ),
                      ),
                      appPro.check
                          ? Padding(
                              padding: EdgeInsets.only(
                                  left: size.width * 0.1,
                                  top: size.height * 0.23),
                              child: Card(
                                // elevation: 1,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                child: Container(
                                  height: size.height * 0.18,
                                  width: size.width * 0.8,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(15),
                                    color: Colors.white,
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 15.0, horizontal: 15),
                                    child: Container(
                                      // color:
                                      //     Colors.green,
                                      child: GridView.builder(
                                        itemCount: appPro.postCategories.length,
                                        gridDelegate:
                                            SliverGridDelegateWithFixedCrossAxisCount(
                                          crossAxisCount: 2,
                                          mainAxisSpacing: 10,
                                          crossAxisSpacing: 5,
                                          childAspectRatio: 4,
                                        ),
                                        itemBuilder: (context, index) {
                                          bool isSelected = appPro.category ==
                                              appPro.postCategories[index];
                                          return PostCategoryItem(
                                            label: appPro.postCategories[index],
                                            textColor: isSelected
                                                ? Colors.white
                                                : blueColor,
                                            backgroundColor: isSelected
                                                ? blueColor
                                                : Colors.white,
                                            onTap: () {
                                              setState(() {
                                                appPro.setCategory(appPro
                                                    .postCategories[index]);
                                                buttonCheck = true;
                                                appPro.check = false;
                                              });
                                            },
                                          );
                                        },
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            )
                          : Container()
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
