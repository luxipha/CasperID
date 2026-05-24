import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/global_singleton.dart';
import 'package:highfedilityadevar/controllers/home_page_controller/search_controller.dart';
import 'package:highfedilityadevar/models/home/search/getAllCityModel.dart';
import 'package:highfedilityadevar/models/home/search/getAllCityModel.dart'
    as city;
import 'package:highfedilityadevar/models/home/search/getAllCompanyModel.dart';
import 'package:highfedilityadevar/models/home/search/getAllRegionModel.dart';
import 'package:highfedilityadevar/models/home/search/getAllRegionModel.dart'
    as region;
import 'package:highfedilityadevar/models/home/search/search_user_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/country_List.dart';
import 'package:highfedilityadevar/views/pages/public_qr_portfolio/public_qr_portfolio_page.dart';
import 'package:highfedilityadevar/views/widgets/form_input.dart';

class SearchPage extends StatefulWidget {
  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> with BaseClass {
  final SearchController controller = SearchController();
  TextEditingController searchTextController = TextEditingController();
  FocusNode searchFocus = FocusNode();
  String searchType = 'name';
  SearchUserModel? searchUserData;
  int _selectedSearch = -1;
  List countries = [];
  List<String> companyList = [''];
  List<String> workList = [''];
  ScrollController? _controllerScroll;
  ScrollController? controllerScrollCity;
  ScrollController? _controllerScrollRegion;
  String? selectedCompany;
  String? selectedWork;
  ScrollController scrollControllerCompany = ScrollController();
  ScrollController scrollControllerWork = ScrollController();
  int pageCountCompany = 1;
  int pageCountWork = 1;
  List<city.Data> cityList = <city.Data>[].obs;
  List<region.Data> regionList = <region.Data>[].obs;

  var diff = 0.0;

  var posSelected = 0;
  var posSelectedCompany = 0;
  var posSelectedWork = 0;

  var height = 0.0;
  late var _sizeheightcontainer;
  late var _heightscroller;
  var _text;
  var _oldtext;
  var _itemsizeheight = 50.0;
  List _alphabet =
      List.generate(26, (i) => String.fromCharCode('A'.codeUnitAt(0) + i));
  List<Map> jsonList = countryList;

  _getAlphabetItem(int index, int selectedPosition, Function() ontap) {
    return Expanded(
      child: InkWell(
        onTap: ontap,
        child: Container(
          width: 20,
          height: 20,
          alignment: Alignment.center,
          //padding: EdgeInsets.only(top: 8,bottom: 8),
          decoration: BoxDecoration(
              color: index == selectedPosition
                  ? AppColors.BUTTON_COLOR.withOpacity(0.5)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(5)
              //shape: BoxShape.circle,
              ),
          child: Text(
            _alphabet[index],
            textAlign: TextAlign.center,
            style: (index == selectedPosition)
                ? TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.black)
                : TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: Colors.black),
          ),
        ),
      ),
    );
  }

  _scrollListener() {
    int scrollPosition =
        (_controllerScroll!.position.pixels / _itemsizeheight).round();
    if (scrollPosition < countries.length) {
      String? countryName = countries.elementAt(scrollPosition)['name'];
      setState(() {
        posSelected =
            countryName![0].toUpperCase().codeUnitAt(0) - 'A'.codeUnitAt(0);
      });
    }

    if ((_controllerScroll!.offset) >=
        (_controllerScroll!.position.maxScrollExtent)) {}
    if (_controllerScroll!.offset <=
            _controllerScroll!.position.minScrollExtent &&
        !_controllerScroll!.position.outOfRange) {}
  }

  searchData(String name) async {
    try {
      showCircularDialog(context);
      SearchUserModel model = await controller.searchUser(
        {
          "firstName": name,
          "lastName": "",
          "pageNum": "1",
          "pageSize": "15",
          "country": controller.selectedCountryName,
          "city": controller.selectedCityName,
          "address": controller.selectedRegionName,
          "searchType": searchType,
          "position": selectedWork,
          "company": selectedCompany,
        },
      );
      popToPreviousScreen(context: context);
      if (model.flag!) {
        searchUserData = model;
      } else {
        showError(title: 'Error', message: model.message!);
      }
      setState(() {});
    } on Exception catch (e) {
      popToPreviousScreen(context: context);
      // showError(
      //   title: 'Error',
      //   message: e.toString(),
      // );
    }
  }
  // CountryCode? selectedItem;

  @override
  void initState() {
    super.initState();

    pageCountCompany = 1;
    scrollControllerCompany = ScrollController()
      ..addListener(scrollListenerCompany);
    pageCountWork = 1;
    scrollControllerWork = ScrollController()..addListener(scrollListenerWork);
    getAllCompanyList(pageCountCompany);

    getAllWorkList(pageCountWork);
    countries = jsonList;

    countries.sort((a, b) {
      return a['name'].toString().compareTo(b['name'].toString());
    });
    // selectedItem = countries[0];
    _controllerScroll = ScrollController();
    _controllerScroll!.addListener(_scrollListener);
    controllerScrollCity = ScrollController();
    _controllerScrollRegion = ScrollController();
  }

  @override
  void dispose() {
    scrollControllerCompany.removeListener(scrollListenerCompany);
    scrollControllerCompany.removeListener(scrollListenerWork);
    super.dispose();
  }

  getAllCompanyList(pageCount) async {
    try {
      List<String> temp = [];
      temp.clear();
      Future.delayed(Duration(microseconds: 1), () {
        showCircularDialog(context);
      });
      GetAllCompanyModel model = await controller.getAllCompany(pageCount);
      popToPreviousScreen(context: context);
      if (model.flag!) {
        temp = model.items!;
        companyList.addAll(temp);

        setState(() {});
      } else {
        showError(title: 'Error', message: model.message!);
      }
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }

  getAllWorkList(pageCount) async {
    try {
      List<String> temp = [];
      temp.clear();
      Future.delayed(Duration(microseconds: 1), () {
        showCircularDialog(context);
      });
      GetAllCompanyModel model = await controller.getAllWork(pageCount);
      popToPreviousScreen(context: context);
      if (model.flag!) {
        temp = model.items!;
        workList.addAll(temp);
        setState(() {});
      } else {
        showError(title: 'Error', message: model.message!);
      }
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }

  scrollListenerCompany() async {
    if (scrollControllerCompany.position.pixels ==
            scrollControllerCompany.position.maxScrollExtent &&
        !scrollControllerCompany.position.outOfRange) {
      pageCountCompany++;
      getAllCompanyList(pageCountCompany);
      setState(() {});
    }
  }

  scrollListenerWork() async {
    if (scrollControllerWork.position.pixels ==
            scrollControllerWork.position.maxScrollExtent &&
        !scrollControllerWork.position.outOfRange) {
      pageCountWork++;
      getAllWorkList(pageCountWork);
      setState(() {});
    }
  }

  getAllCity(countryId) async {
    try {
      showCircularDialog(context);
      GetAllCityModel model = await controller.getAllCity(countryId);
      popToPreviousScreen(context: context);
      cityList.clear();
      if (model.flag!) {
        cityList.assignAll(model.data!);
        cityList.sort((a, b) {
          return a.name.toString().compareTo(b.name.toString());
        });
      } else {
        showError(title: 'Error', message: model.message!);
      }
      setState(() {});
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }

  getAllRegion(cityId) async {
    try {
      showCircularDialog(context);
      GetAllRegionModel model = await controller.getAllRegion(cityId);
      popToPreviousScreen(context: context);
      regionList.clear();
      if (model.flag!) {
        regionList.assignAll(model.data!);
        regionList.sort((a, b) {
          return a.name.toString().compareTo(b.name.toString());
        });
      } else {
        showError(title: 'Error', message: model.message!);
      }
      setState(() {});
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Search',
          style: GoogleFonts.roboto(
            color: Colors.black,
          ),
        ),
        centerTitle: true,
        // actions: [
        //   TextButton(
        //     onPressed: () {},
        //     child: Text(
        //       'History',
        //       style: GoogleFonts.roboto(
        //         color: Colors.black,
        //       ),
        //     ),
        //   ),
        // ],
      ),
      body: Container(
        margin: EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          children: [
            FormInput(
              textEditingController: searchTextController,
              label: '',
              formRadius: 15,
              textInputAction: TextInputAction.search,
              onChanged: (String? value) {
                if (searchTextController.text.isEmpty) {
                  searchUserData = null;
                }
                WidgetsBinding.instance!
                    .addPostFrameCallback((_) => setState(() {}));
              },
              onFieldSubmitted: (value) {
                searchFocus.unfocus();
                FocusManager.instance.primaryFocus?.unfocus();
                searchData(
                  searchTextController.text.toString(),
                );
              },
              focusNode: searchFocus,
              hintText: 'Please enter your name',
              borderColor: Colors.blue,
              suffixIcon: InkWell(
                onTap: () async {
                  FocusManager.instance.primaryFocus?.unfocus();
                  if (searchTextController.text.isNotEmpty) {
                    if (GlobalSingleton()
                            .recentSearchResultList
                            .toSet()
                            .toList()
                            .length ==
                        12) {
                      GlobalSingleton()
                          .recentSearchResultList
                          .toSet()
                          .toList()
                          .removeAt(0);
                      GlobalSingleton()
                          .recentSearchResultList
                          .toSet()
                          .toList()
                          .add(
                            searchTextController.text.toString(),
                          );
                    } else {
                      GlobalSingleton().recentSearchResultList.add(
                            searchTextController.text.toString(),
                          );
                    }

                    searchData(
                      searchTextController.text.toString(),
                    );
                  }
                },
                child: Icon(
                  Icons.search,
                  color: Colors.blue,
                ),
              ),
            ),
            SizedBox(
              height: 30,
            ),
            Container(
              color: Colors.white,
              height: 80,
              child: Row(
                children: [
                  selectedSearchWidget(1, 'City', AppImages.CITY),
                  selectedSearchWidget(3, 'Work', AppImages.WORK),
                  selectedSearchWidget(4, 'Company', AppImages.COMPANY),
                  selectedSearchWidget(2, 'Rating', AppImages.RATING),
                ],
              ),
            ),
            Expanded(
              child: StatefulBuilder(
                builder: (BuildContext context, StateSetter setState) {
                  return Container(
                    decoration: BoxDecoration(
                      color: AppColors.FORM_GREY,
                      borderRadius: BorderRadius.only(
                        topRight: _selectedSearch == 1 ||
                                _selectedSearch == 2 ||
                                _selectedSearch == 3
                            ? Radius.circular(15)
                            : Radius.circular(0),
                        topLeft: _selectedSearch == 1
                            ? Radius.circular(0)
                            : Radius.circular(15),
                        bottomRight: Radius.circular(15),
                        bottomLeft: Radius.circular(15),
                      ),
                    ),
                    child: _selectedSearch == 1
                        ? _selectedSearch == 1 && searchUserData != null
                            ? _getRatingWidget(searchUserData)
                            : _getCityWidget()
                        : _selectedSearch == 2
                            ? _getRatingWidget(searchUserData)
                            : _selectedSearch == 3
                                ? _selectedSearch == 3 && searchUserData != null
                                    ? _getRatingWidget(searchUserData)
                                    : _getWorkWidget()
                                : _selectedSearch == 4
                                    ? _selectedSearch == 4 &&
                                            searchUserData != null
                                        ? _getRatingWidget(searchUserData)
                                        : _getCompanyWidget()
                                    : _getRatingWidget(searchUserData),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _offsetContainer = 0.0;

  void _onVerticalDragStart(DragStartDetails details) {
    _offsetContainer = details.globalPosition.dy - diff;
  }

  void _onVerticalDragUpdate(DragUpdateDetails details) {
    setState(() {
      if ((_offsetContainer + details.delta.dy) >= 0 &&
          (_offsetContainer + details.delta.dy) <=
              (_sizeheightcontainer - _heightscroller)) {
        _offsetContainer += details.delta.dy;
        posSelected =
            ((_offsetContainer / _heightscroller) % _alphabet.length).round();
        _text = _alphabet[posSelected];
        if (_text != _oldtext) {
          for (var i = 0; i < countries.length; i++) {
            if (_text.toString().compareTo(
                    countries[i]['name'].toString().toUpperCase()[0]) ==
                0) {
              _controllerScroll!.jumpTo((i * _itemsizeheight) + 15);
              break;
            }
          }
          _oldtext = _text;
        }
      }
    });
  }

  Widget getListCountry(country) {
    return Container(
      height: 50,
      color: AppColors.FORM_GREY,
      child: Material(
        color: controller.selectedCountryName == country['name']
            ? AppColors.BUTTON_COLOR_WITH_OPACITY
            : Colors.transparent,
        child: ListTile(
          // leading: CountryPickerUtils.getDefaultFlagImage(Country.fromMap(map)),
          // Image.asset(

          //   // e.flagUri!,
          //   package: 'country_list_pick',
          //   width: 30.0,
          // ),
          title: Text(country['name']),
          onTap: () {
            posSelected = 0;
            controller.selectedCountryName = country['name'];
            getAllCity(country['couid']);
            // _sendDataBack(context, e);
          },
        ),
      ),
    );
  }

  Widget _getWorkWidget() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        children: [
          Expanded(
            child: StaggeredGridView.countBuilder(
              crossAxisCount: 2,
              itemCount: workList.length - 1,
              controller: scrollControllerWork,
              itemBuilder: (BuildContext context, int index) => Container(
                decoration: BoxDecoration(
                  color: selectedWork == workList[index + 1]
                      ? AppColors.BUTTON_COLOR_WITH_OPACITY
                      : Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8.0,
                      offset: Offset(0.0, 1),
                    ),
                  ],
                ),
                child: GestureDetector(
                  onTap: () {
                    selectedWork = workList[index + 1];
                    if (searchTextController.text.isNotEmpty) {
                      searchData(searchTextController.text.toString());
                    }

                    setState(() {});
                  },
                  child: Container(
                    height: 50,
                    child: Center(
                      child: Text(
                        workList[index + 1],
                        style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontSize: 14,
                            fontWeight: FontWeight.w400),
                      ),
                    ),
                  ),
                ),
              ),
              staggeredTileBuilder: (int index) => new StaggeredTile.fit(1),
              mainAxisSpacing: 20.0,
              crossAxisSpacing: 15.0,
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: SingleChildScrollView(
              child: Container(
                height: 20.0 * 30,
                color: Colors.transparent,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: []..addAll(
                      List.generate(
                        _alphabet.length,
                        (index) => _getAlphabetItem(
                          index,
                          posSelectedWork,
                          () {
                            workList.clear();
                            workList.add('');
                            posSelectedWork = index;
                            controller.workNameInitial =
                                _alphabet[posSelectedWork];

                            pageCountWork = 1;

                            scrollControllerWork = ScrollController()
                              ..addListener(scrollListenerWork);
                            setState(() {});
                            getAllWorkList(pageCountWork);
                            _text = _alphabet[posSelectedWork];
                          },
                        ),
                      ),
                    ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _getCityWidget() {
    return Column(
      children: [
        Row(
          children: [
            if (controller.selectedCountryName != '')
              Text(
                '${controller.selectedCountryName} > ',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            if (controller.selectedCityName != '')
              InkWell(
                onTap: () {
                  controller.selectedRegionName = '';
                  regionList.clear();
                },
                child: Text(
                  '${controller.selectedCityName} > ',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            if (controller.selectedRegionName != '')
              Text(
                '${controller.selectedRegionName}',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
          ],
        ),
        Expanded(
          child: regionList.isNotEmpty
              ? Container(
                  padding: EdgeInsets.symmetric(horizontal: 5),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    color: AppColors.FORM_GREY,
                  ),
                  child: Theme(
                    data: ThemeData(
                      scrollbarTheme: ScrollbarThemeData(
                        trackColor:
                            MaterialStateProperty.all(Color(0xffE2E2E2)),
                        thumbColor:
                            MaterialStateProperty.all(Color(0xff0078D4)),
                        isAlwaysShown: true,
                        interactive: true,
                        radius: Radius.circular(10),
                        mainAxisMargin: 1,
                      ),
                    ),
                    child: Scrollbar(
                      isAlwaysShown: true,
                      controller: _controllerScrollRegion,
                      radius: Radius.circular(10),
                      thickness: 5,
                      trackVisibility: true,
                      interactive: true,
                      showTrackOnHover: true,
                      hoverThickness: 5,
                      child: CustomScrollView(
                        controller: _controllerScrollRegion,
                        physics: const AlwaysScrollableScrollPhysics(),
                        slivers: [
                          SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                return Container(
                                  height: 50,
                                  color: AppColors.FORM_GREY,
                                  child: Material(
                                    color: Colors.transparent,
                                    child: ListTile(
                                      title: Text(
                                        regionList[index].name != ""
                                            ? regionList[index].name!
                                            : regionList[index].cname!,
                                      ),
                                      onTap: () {
                                        controller.selectedRegionName =
                                            regionList[index].name != ""
                                                ? regionList[index].name!
                                                : regionList[index].cname!;
                                        setState(() {});
                                      },
                                    ),
                                  ),
                                );
                              },
                              childCount: regionList.length,
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                )
              : cityList.isNotEmpty
                  ? Container(
                      padding: EdgeInsets.symmetric(horizontal: 5),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(30),
                        color: AppColors.FORM_GREY,
                      ),
                      child: Theme(
                        data: ThemeData(
                          scrollbarTheme: ScrollbarThemeData(
                            trackColor:
                                MaterialStateProperty.all(Color(0xffE2E2E2)),
                            thumbColor:
                                MaterialStateProperty.all(Color(0xff0078D4)),
                            isAlwaysShown: true,
                            interactive: true,
                            radius: Radius.circular(10),
                            mainAxisMargin: 1,
                          ),
                        ),
                        child: Scrollbar(
                          isAlwaysShown: true,
                          controller: controllerScrollCity,
                          radius: Radius.circular(10),
                          thickness: 5,
                          trackVisibility: true,
                          interactive: true,
                          showTrackOnHover: true,
                          hoverThickness: 5,
                          child: CustomScrollView(
                            controller: controllerScrollCity,
                            physics: const AlwaysScrollableScrollPhysics(),
                            slivers: [
                              SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) {
                                    return Container(
                                      height: 50,
                                      color: AppColors.FORM_GREY,
                                      child: Material(
                                        color: controller.selectedCityName ==
                                                (cityList[index].name != ''
                                                    ? cityList[index].name!
                                                    : cityList[index].cname!)
                                            ? AppColors
                                                .BUTTON_COLOR_WITH_OPACITY
                                            : Colors.transparent,
                                        child: ListTile(
                                          title: Text(cityList[index].name != ''
                                              ? cityList[index].name!
                                              : cityList[index].cname!),
                                          onTap: () {
                                            controller.selectedCityName =
                                                cityList[index].name!;
                                            setState(() {});
                                            getAllRegion(cityList[index].citid);
                                          },
                                        ),
                                      ),
                                    );
                                  },
                                  childCount: cityList.length,
                                ),
                              )
                            ],
                          ),
                        ),
                      ),
                    )
                  : Container(
                      padding: EdgeInsets.symmetric(horizontal: 5),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(30),
                        color: AppColors.FORM_GREY,
                      ),
                      child: Stack(
                        children: [
                          CustomScrollView(
                            controller: _controllerScroll,
                            physics: const AlwaysScrollableScrollPhysics(),
                            slivers: [
                              SliverList(
                                delegate: SliverChildBuilderDelegate(
                                    (context, index) {
                                  return getListCountry(
                                      countries.elementAt(index));
                                }, childCount: countries.length),
                              )
                            ],
                          ),
                          Align(
                            alignment: Alignment.centerRight,
                            child: GestureDetector(
                              onVerticalDragUpdate: _onVerticalDragUpdate,
                              onVerticalDragStart: _onVerticalDragStart,
                              child: Container(
                                height: 20.0 * 30,
                                color: Colors.transparent,
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: []..addAll(
                                      List.generate(
                                        _alphabet.length,
                                        (index) => _getAlphabetItem(
                                          index,
                                          posSelected,
                                          () {
                                            setState(
                                              () {
                                                posSelected = index;
                                                _text = _alphabet[posSelected];
                                                if (_text != _oldtext) {
                                                  for (var i = 0;
                                                      i < countries.length;
                                                      i++) {
                                                    if (_text.toString().compareTo(
                                                            countries[i]['name']
                                                                    .toString()
                                                                    .toUpperCase()[
                                                                0]) ==
                                                        0) {
                                                      _controllerScroll!.jumpTo(
                                                          (i * _itemsizeheight) +
                                                              10);

                                                      break;
                                                    }
                                                  }
                                                  _oldtext = _text;
                                                }
                                              },
                                            );
                                          },
                                        ),
                                      ),
                                    ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _getCompanyWidget() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 20,
        ),
        Container(
          margin: EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'Company',
            style: GoogleFonts.roboto(
                color: Colors.black, fontSize: 20, fontWeight: FontWeight.w700),
          ),
        ),
        SizedBox(
          height: 20,
        ),
        Expanded(
          child: Row(
            children: [
              Expanded(
                child: ListView.builder(
                  // shrinkWrap: true,
                  itemCount: companyList.length - 1,
                  controller: scrollControllerCompany,
                  physics: AlwaysScrollableScrollPhysics(),
                  itemBuilder: (context, int index) {
                    return InkWell(
                      onTap: () {
                        selectedCompany = companyList[index + 1];
                        if (searchTextController.text.isNotEmpty) {
                          searchData(searchTextController.text.toString());
                        }
                        setState(() {});
                      },
                      child: Container(
                        padding: EdgeInsets.all(5),
                        margin: EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(5),
                          color: selectedCompany == companyList[index + 1]
                              ? AppColors.BUTTON_COLOR_WITH_OPACITY
                              : AppColors.FORM_GREY,
                        ),
                        child: Text(
                          companyList[index + 1],
                          style: TextStyle(fontSize: 16),
                        ),
                      ),
                    );
                  },
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: SingleChildScrollView(
                  child: Container(
                    height: 20.0 * 30,
                    color: Colors.transparent,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: []..addAll(
                          List.generate(
                            _alphabet.length,
                            (index) => _getAlphabetItem(
                              index,
                              posSelectedCompany,
                              () {
                                companyList.clear();
                                companyList.add('');
                                posSelectedCompany = index;
                                controller.companyNameInitial =
                                    _alphabet[posSelectedCompany];

                                pageCountCompany = 1;

                                scrollControllerCompany = ScrollController()
                                  ..addListener(scrollListenerCompany);
                                setState(() {});
                                getAllCompanyList(pageCountCompany);
                                _text = _alphabet[posSelected];
                              },
                            ),
                          ),
                        ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _getRatingWidget(SearchUserModel? dataList) {
    return StatefulBuilder(builder: (context, StateSetter stateSetter) {
      return dataList != null
          ? ListView.builder(
              itemCount: dataList.items!.length,
              shrinkWrap: true,
              itemBuilder: (BuildContext context, int index) {
                return InkWell(
                  onTap: () {
                    Get.to(
                      () => PublicQrPortfolioPage(
                        userId: dataList.items![index].userId.toString(),
                        portfolioUrl:
                            '/socialContact/card/QRBusinessCard/${dataList.items![index].userId.toString()}',
                        fromUpdateProfile: 'search',
                      ),
                    );
                  },
                  child: Container(
                    height: 100,
                    margin: EdgeInsets.only(top: 8),
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    decoration: BoxDecoration(
                        // color: index == 1
                        //     ? AppColors.BUTTON_COLOR_WITH_OPACITY
                        //     : AppColors.FORM_GREY,
                        borderRadius:
                            BorderRadius.circular(index == 1 ? 15 : 0)),
                    child: Row(
                      children: [
                        Center(
                          child: Container(
                              height: 60,
                              width: 60,
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(50),
                                child: Image.network(
                                  dataList.items![index].logoUrl!,
                                  fit: BoxFit.cover,
                                ),
                              )
                              // Image(
                              //   image: AssetImage(
                              //     AppImages.face_confirm,
                              //   ),
                              //   height: 60,
                              //   width: 60,
                              // ),
                              ),
                        ),
                        Expanded(
                          child: Container(
                            margin: EdgeInsets.only(left: 20),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  '${dataList.items![index].firstName!} ${dataList.items![index].lastName!}', //  'jason wang',
                                  style: GoogleFonts.roboto(
                                      color: Colors.black,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500),
                                ),
                                SizedBox(
                                  height: 5,
                                ),
                                if (searchType == 'company' ||
                                    searchType == 'work')
                                  Text(
                                    dataList.items![index]
                                        .city!, //   'UX designer Xiamen',
                                    style: GoogleFonts.roboto(
                                      color: Colors.grey,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                if (searchType != 'company' &&
                                    searchType != 'work')
                                  Text(
                                    dataList.items![index]
                                        .position!, //   'UX designer Xiamen',
                                    style: GoogleFonts.roboto(
                                      color: Colors.grey,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                              ],
                              crossAxisAlignment: CrossAxisAlignment.start,
                            ),
                          ),
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (searchType == 'city' &&
                                dataList.items![index].distance!.toString() !=
                                    'unknown')
                              Text(
                                '${dataList.items![index].distance!.toString()}',
                                // index == 1 ? '45k' : '356K',
                                style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w400),
                              ),
                            if (searchType == 'rating')
                              Text(
                                '${dataList.items![index].rating!.toString()}K',
                                // index == 1 ? '45k' : '356K',
                                style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500),
                              ),
                            if (searchType == 'company' || searchType == 'work')
                              Text(
                                '${dataList.items![index].position!.toString()}',
                                // index == 1 ? '45k' : '356K',
                                style: GoogleFonts.roboto(
                                    color: Colors.blue,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w400),
                              ),
                            if (dataList.items![index].online != '')
                              Row(
                                children: [
                                  Icon(
                                    dataList.items![index].online!.toString() ==
                                            'online'
                                        ? Icons.circle
                                        : Icons.timelapse,
                                    color: dataList.items![index].online!
                                                .toString() ==
                                            'online'
                                        ? Colors.green
                                        : Colors.grey,
                                    size: 12,
                                  ),
                                  Text(
                                    dataList.items![index].online!
                                        .toString(), // index == 1 ? 'On-line' : '1h ago',
                                    style: GoogleFonts.roboto(
                                      color: dataList.items![index].online!
                                                  .toString() ==
                                              'online'
                                          ? Colors.green
                                          : Colors.grey,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            )
          : GlobalSingleton().recentSearchResultList.toList().length != 0
              ? searchResult()
              : Container(
                  width: Get.width,
                  child: Center(
                    child: Text(
                      'Search',
                      style: TextStyle(
                        fontSize: 18,
                      ),
                    ),
                  ),
                );
    });
  }

  searchResult() {
    return Container(
      padding: EdgeInsets.all(10),
      width: Get.width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Search History',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(
            height: 15,
          ),
          Wrap(
            spacing: 8,
            runSpacing: 5,
            children: List<Widget>.generate(
              GlobalSingleton().recentSearchResultList.toSet().toList().length,
              (index) => InkWell(
                onTap: () {
                  FocusManager.instance.primaryFocus?.unfocus();
                  searchData(GlobalSingleton()
                      .recentSearchResultList
                      .toSet()
                      .toList()[index]
                      .toString());
                },
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    color: Colors.grey.withOpacity(0.2),
                  ),
                  child: Text(
                      '${GlobalSingleton().recentSearchResultList.toSet().toList()[index]}'),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 20,
          ),
          Center(
            child: InkWell(
              onTap: () {
                GlobalSingleton().recentSearchResultList.clear();
                setState(() {});
              },
              child: Text(
                'Clear History',
                style: TextStyle(
                  fontSize: 12,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  resetData() {
    searchType = 'name';
    searchUserData = null;
    posSelectedCompany = 0;
    posSelectedWork = 0;
    pageCountCompany = 1;
    pageCountWork = 1;
    workList.clear();
    workList.add('');
    companyList.clear();
    companyList.add('');
    selectedCompany = '';
    selectedWork = '';
    controller.companyNameInitial = "A";
    controller.workNameInitial = "A";
    cityList = [];
    regionList = [];
    controller.selectedCountryName = '';
    controller.selectedCityName = '';
    controller.selectedRegionName = '';
  }

  Widget selectedSearchWidget(int index, String title, String assetsUrl) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          resetData();
          setState(() {
            _selectedSearch = index;

            searchType = title.toLowerCase();
          });
          if (index == 4) {
            getAllCompanyList(pageCountCompany);
          }
          if (index == 3) {
            getAllWorkList(pageCountWork);
          }
          if (index == 2) {
            if (searchTextController.text.isNotEmpty) {
              searchData(searchTextController.text.toString());
            }
          }
        },
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            color:
                _selectedSearch == index ? AppColors.FORM_GREY : Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(15),
              topRight: Radius.circular(15),
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                children: [
                  Image(
                    image: AssetImage(assetsUrl),
                    height: 21,
                    width: 21,
                    color: _selectedSearch == index
                        ? AppColors.BUTTON_COLOR
                        : Colors.grey,
                  ),
                  SizedBox(
                    width: 3,
                  ),
                  Image(
                    image: AssetImage(AppImages.DROP_DOWN),
                    height: 10,
                    width: 10,
                    color:
                        _selectedSearch == index ? Colors.black : Colors.grey,
                  ),
                ],
                mainAxisAlignment: MainAxisAlignment.center,
              ),
              SizedBox(
                height: 8,
              ),
              Text(
                title,
                style: GoogleFonts.roboto(
                  color: _selectedSearch == index ? Colors.black : Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
