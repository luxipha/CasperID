import 'package:get/get.dart';
import 'package:highfedilityadevar/consts/app_images.dart';

class ChangeTutorialImageController extends GetxController {
  int selectedIndex = 0;

  List<String> _images = [
    AppImages.RIVE_ONE,
    AppImages.RIVE_TWO,
    AppImages.RIVE_THREE,
  ];

  void changeIndex(int index) {
    selectedIndex = index;
    update();
  }
  String get selectedImage => _images[selectedIndex];
}
