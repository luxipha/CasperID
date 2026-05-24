import 'package:flutter/material.dart';
import 'package:flutter_datetime_picker/flutter_datetime_picker.dart';
import 'package:flutter_keyboard_visibility/flutter_keyboard_visibility.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_global_data.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/black_list_controller/BlackListController.dart';
import 'package:highfedilityadevar/models/black_list_model/BlackListModel.dart';
import 'package:highfedilityadevar/models/black_list_model/DeleteUserFromBlackListModel.dart';
import 'package:highfedilityadevar/models/black_list_model/SearchUserListModel.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:material_floating_search_bar/material_floating_search_bar.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';

class BlockUserPage extends StatefulWidget {
  @override
  State<BlockUserPage> createState() => _BlockUserPageState();
}

class _BlockUserPageState extends State<BlockUserPage> with BaseClass {
  bool isEdit = false;
  bool isOpen = false;
  var authToken = "";
  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());

  TextEditingController searchEdtText = TextEditingController();
  var showSearchBlock = false;
  BlackListModel? blackListModel;
  SearchUserListModel? searchUserListModel;

  final BlackListController _blackListControllerController =
      Get.isRegistered<BlackListController>()
          ? Get.find<BlackListController>()
          : Get.put(BlackListController());

  FloatingSearchBarController floatingSearchBarController =
      FloatingSearchBarController();
  FocusNode _focusNode = new FocusNode();

  Widget buildFloatingSearchBar() {
    final isPortrait =
        MediaQuery.of(context).orientation == Orientation.portrait;

    return FloatingSearchBar(
      hint: 'Enter the phone number',
      closeOnBackdropTap: true,

      border: BorderSide(
        color: isOpen ? AppColors.BUTTON_COLOR : AppColors.FORM_GREY,
        width: 2,
      ),
      automaticallyImplyDrawerHamburger: false,
      automaticallyImplyBackButton: false,
      iconColor: AppColors.BUTTON_COLOR,
      elevation: 0,
      scrollPadding: const EdgeInsets.only(top: 16, bottom: 56),
      transitionDuration: const Duration(milliseconds: 800),
      accentColor: Colors.blue,

      height: 54,
      controller: floatingSearchBarController,
      transitionCurve: Curves.easeInOut,
      backgroundColor: AppColors.FORM_GREY,
      borderRadius: BorderRadius.all(Radius.circular(15)),
      backdropColor: Colors.white,

      physics: const BouncingScrollPhysics(),
      axisAlignment: isPortrait ? 0.0 : -1.0,
      openAxisAlignment: 0.0,
      width: isPortrait ? 600 : 500,
      onFocusChanged: (value) {
        isOpen = value;
        setState(() {});
      },

      debounceDelay: const Duration(milliseconds: 500),
      onQueryChanged: (query) {
        // Call your model, bloc, controller here.
      },
      // Specify a custom transition to be used for
      // animating between opened and closed stated.
      transition: CircularFloatingSearchBarTransition(),
      leadingActions: [
        isOpen
            ? Container()
            : Icon(
                Icons.search,
                color: AppColors.FORM_ICON,
              ),
        SizedBox(
          width: 5,
        ),
      ],
      actions: [
        FloatingSearchBarAction.searchToClear(
          showIfClosed: false,
        ),
      ],
      builder: (context, transition) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Material(
            color: Colors.white,
            elevation: 4.0,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: Colors.accents.map((color) {
                return Column(
                  children: [
                    ListTile(
                      trailing: Container(
                        width: 66,
                        height: 30,
                        decoration: BoxDecoration(
                          color: AppColors.BUTTON_COLOR,
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Center(
                          child: Text(
                            'Block',
                            style: GoogleFonts.roboto(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ),
                      ),
                      leading: Image(
                        image: AssetImage(
                          AppImages.face_confirm,
                        ),
                        height: 50,
                        width: 50,
                      ),
                      title: Text(
                        'Jason wang',
                        style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontSize: 18,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      subtitle: Text(
                        'ID:12345678',
                        style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ),
                    Divider()
                  ],
                );
              }).toList(),
            ),
          ),
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    getAuthToken();
    getBlackList();
    setSearchEditTextListener();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
  }

  void _onFocusChange() {
    print("Focus: ${_focusNode.hasFocus.toString()}");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Block user',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () {
              if (isEdit == false) {
                _focusNode.unfocus();
                isEdit = true;
              } else {
                isEdit = false;
              }
              setState(() {});
            },
            child: Text(
              'Edit',
              style: GoogleFonts.roboto(
                color: AppColors.BUTTON_COLOR,
                fontWeight: FontWeight.w400,
              ),
            ),
          )
        ],
      ),
      body: KeyboardVisibilityBuilder(builder: (context, isKeyboardVisible) {
        return Container(
          child: Stack(
            children: [
              blackListModel != null
                  ? Container(
                      margin: EdgeInsets.only(
                          left: 30, right: 30, top: 90, bottom: 20),
                      child: GridView.builder(
                          itemCount: blackListModel!.item.length,
                          physics: NeverScrollableScrollPhysics(),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 3,
                                  crossAxisSpacing: 22,
                                  childAspectRatio: 0.8,
                                  mainAxisSpacing: 22),
                          shrinkWrap: true,
                          scrollDirection: Axis.vertical,
                          itemBuilder: (BuildContext context, int index) {
                            return GestureDetector(
                              onTap: () {},
                              child: Column(
                                children: [
                                  Stack(
                                    children: [
                                      Container(
                                        height: 85,
                                        width: 85,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                        ),
                                        child: Stack(
                                          children: [
                                            ClipOval(
                                              child: Image.network(
                                                blackListModel
                                                    ?.item[index].logo,
                                                width: 85,
                                                height: 85,
                                                fit: BoxFit.cover,
                                              ),
                                            ),
                                            isEdit
                                                ? Positioned(
                                                    top: 5,
                                                    right: 8,
                                                    child: InkWell(
                                                      onTap: () {
                                                        deleteBlackListUser(
                                                            blackListModel
                                                                ?.item[index]
                                                                .userId);
                                                      },
                                                      child: Image(
                                                        image: AssetImage(
                                                            AppImages.DELETE),
                                                        height: 20,
                                                        width: 20,
                                                      ),
                                                    ),
                                                  )
                                                : Container(),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 8,
                                  ),
                                  Text(
                                    "${blackListModel?.item[index].firstName} ${blackListModel?.item[index].lastName}",
                                    style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 11,
                                        color: Colors.black),
                                  ),
                                ],
                              ),
                            );
                          }),
                    )
                  : Container(),
              Container(
                margin: EdgeInsets.symmetric(horizontal: 20),
                child: FormInputWithHint(
                  textEditingController: searchEdtText,
                  label: '',
                  filledColor: AppColors.FORM_GREY,
                  borderRadius: 15,
                  keyboardType: TextInputType.number,
                  borderColor: isKeyboardVisible
                      ? AppColors.BUTTON_COLOR
                      : AppColors.FORM_GREY,
                  hintText: 'Enter the phone number',
                  prefixIcon: Icon(
                    Icons.search,
                    color: AppColors.FORM_ICON,
                    size: isKeyboardVisible ? 0 : 20,
                  ),
                  suffixIcon: InkWell(
                    onTap: () {
                      searchEdtText.text = "";
                    },
                    child: Icon(
                      Icons.cancel,
                      color: AppColors.BUTTON_COLOR_WITH_OPACITY,
                      size: isKeyboardVisible ? 20 : 0,
                    ),
                  ),
                  onChanged: (searchQuery) {
                    // hitUserSearchApi(searchQuery);
                  },
                  focusNode: _focusNode,
                ),
              ),
              isKeyboardVisible
                  ? showSearchBlock
                      ? Container(
                          margin: EdgeInsets.only(
                              left: 20, right: 20, top: 75, bottom: 20),
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: AppColors.BUTTON_COLOR,
                              )),
                          child: ListView.builder(
                              itemCount: searchUserListModel!.item.length,
                              itemBuilder: (BuildContext context, int index) {
                                return Container(
                                  child: Column(
                                    children: [
                                      ListTile(
                                        trailing: InkWell(
                                          onTap: () {
                                            hitAddUserBlackListApi(
                                                searchUserListModel
                                                    ?.item[index].ecuserId);
                                          },
                                          child: Container(
                                            width: 66,
                                            height: 30,
                                            decoration: BoxDecoration(
                                              color: AppColors.BUTTON_COLOR,
                                              borderRadius:
                                                  BorderRadius.circular(15),
                                            ),
                                            child: Center(
                                              child: Text(
                                                'Block',
                                                style: GoogleFonts.roboto(
                                                  color: Colors.white,
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w400,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                        leading: ClipOval(
                                          child: Image.network(
                                            searchUserListModel
                                                ?.item[index].logo,
                                            height: 50,
                                            width: 50,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                        title: Text(
                                          "${searchUserListModel?.item[index].firstName ?? ""} ${searchUserListModel?.item[index].lastName ?? ""} ",
                                          style: GoogleFonts.roboto(
                                            color: Colors.black,
                                            fontSize: 18,
                                            fontWeight: FontWeight.w400,
                                          ),
                                        ),
                                        subtitle: Text(
                                          'ID:${searchUserListModel?.item[index].ecuserId ?? ""}',
                                          style: GoogleFonts.roboto(
                                            color: Colors.black,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w400,
                                          ),
                                        ),
                                      ),
                                      Divider()
                                    ],
                                  ),
                                );
                              }),
                        )
                      : Container()
                  : Container()
              /*  buildFloatingSearchBar(),*/
            ],
          ),
        );
      }),
    );
  }

  void getBlackList() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      blackListModel = await _blackListControllerController.getBlackList(
          userDataModel.authToken!, "1", "15");
      setState(() {
        blackListModel;
      });
      if (blackListModel?.flag) {
        print(blackListModel);
        setState(() {
          _focusNode.unfocus();
          showSearchBlock = false;
        });

        Navigator.pop(context);
      } else {
        throw blackListModel?.message;
      }
    } catch (e) {
      Navigator.pop(context);
      // showError(title: 'Error', message: e.toString());
      print("Error $e");
    }
  }

  void deleteBlackListUser(userId) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      DeleteUserFromBlackListModel model = await _blackListControllerController
          .deleteUserFromBlackList(userDataModel.authToken!, userId.toString());
      if (model.flag) {
        print(model);
        setState(() {
          isEdit = false;
        });
        getBlackList();
        Navigator.pop(context);
        showSuccess(title: 'Success', message: model.message);
      } else {
        throw model.message;
      }
    } catch (e) {
      Navigator.pop(context);
      // showError(title: 'Error', message: e.toString());
      print("Error $e");
    }
  }

  void getAuthToken() async {}

  void hitUserSearchApi(searchQuery) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      searchUserListModel = await _blackListControllerController.searchUser(
          userDataModel.authToken!, "+$searchQuery");

      setState(() {
        searchUserListModel;
        if (searchUserListModel!.item.isNotEmpty) {
          showSearchBlock = true;
        } else {
          showSearchBlock = false;
        }
      });

      if (searchUserListModel?.flag) {
        print(searchUserListModel);
        // showSuccess(title: 'Success', message: searchUserListModel?.message);
      } else {
        throw searchUserListModel?.message;
      }
    } catch (e) {
      // showError(title: 'Error', message: e.toString());
      print("Error $e");
    }
  }

  void hitAddUserBlackListApi(userID) async {
    showCircularDialog(context);
    print("Hitted");
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _blackListControllerController.addUserInBlackList(
          userDataModel.authToken!, userID.toString());

      Navigator.pop(context);
      FocusManager.instance.primaryFocus?.unfocus();
      if (model.flag) {
        print(model);
        setState(() {
          searchEdtText.text = "";
        });
        getBlackList();
        showSuccess(title: 'Success', message: model.message);
      } else {
        showError(title: 'Error', message: model.message);
        print("Error123 ${model.message}");
      }
    } catch (e) {
      // showError(title: 'Error', message: e.toString());
    }
  }

  void setSearchEditTextListener() {
    searchEdtText = TextEditingController()
      ..addListener(() {
        hitUserSearchApi(searchEdtText.text);
      });
  }
}
