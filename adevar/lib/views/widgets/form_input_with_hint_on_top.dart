import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';

class FormInputWithHint extends StatelessWidget {
  final String label;
  final bool obscureText;
  final TextInputType? keyboardType;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final Key? key;
  final String? errorText;
  final Function? onChanged;
  final FocusNode? focusNode;
  final String? initialValue;
  final String? hintText;
  final Color borderColor;
  final int maxLine;
  final bool isEnabled;
  final bool isLabelImage;
  final double textFieldHeight;
  final double horizontalPadding;

  final String? labelImage;
  final bool isMandatory;
  final Color labelColor;
  final double labelFontSize;

  final double borderRadius;

  final FontWeight labelFontWeight;

  final double inputHeight;

  final TextEditingController? textEditingController;

  final Color filledColor;
  final int maxLength;

  FormInputWithHint({
    required this.label,
    this.obscureText = false,
    this.keyboardType,
    this.borderRadius = 10,
    this.horizontalPadding = 10,
    this.inputHeight = 56,
    this.labelFontWeight = FontWeight.w700,
    this.labelColor = Colors.black,
    this.prefixIcon,
    this.borderColor = Colors.white,
    this.textEditingController,
    this.filledColor = AppColors.FORM_GREY,
    this.labelFontSize = 18,
    this.labelImage,
    this.suffixIcon,
    this.maxLength = 200,
    this.key,
    this.isMandatory = false,
    this.isLabelImage = false,
    this.isEnabled = true,
    this.maxLine = 1,
    this.errorText,
    @required this.onChanged,
    @required this.focusNode,
    this.initialValue,
    this.hintText,
    this.textFieldHeight = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        Container(
          alignment: Alignment.centerLeft,
          child: Row(
            children: [
              isMandatory
                  ? Text(
                      '*',
                      style: GoogleFonts.roboto(
                        textStyle: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 18,
                          color: Colors.red,
                        ),
                      ),
                    )
                  : Container(),
              isLabelImage
                  ? Container(
                      margin: EdgeInsets.only(right: 10),
                      child: Image(
                        image: AssetImage(
                          labelImage!,
                        ),
                        height: 20,
                        width: 20,
                      ),
                    )
                  : Container(),
              Text(
                label,
                style: GoogleFonts.roboto(
                  textStyle: TextStyle(
                    fontWeight: labelFontWeight,
                    fontSize: labelFontSize,
                    color: labelColor,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 5,
        ),
        Container(
          height: inputHeight,
          child: Container(
            width: double.infinity,
            height: double.infinity,
            child: TextFormField(
              controller: textEditingController,
              focusNode: focusNode,
              enabled: isEnabled,
              inputFormatters: [
                /*  FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),*/
              ],
              maxLength: maxLength,
              decoration: InputDecoration(
                  counterText: "",
                  filled: true,
                  fillColor: filledColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(borderRadius),
                    borderSide: BorderSide(width: 1, style: BorderStyle.none),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(
                      borderRadius,
                    ),
                    borderSide: BorderSide(width: 1, color: borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(
                      borderRadius,
                    ),
                    borderSide: BorderSide(width: 1, color: borderColor),
                  ),
                  contentPadding: EdgeInsets.symmetric(
                    vertical: textFieldHeight,
                    horizontal: horizontalPadding,
                  ),
                  prefixIcon: prefixIcon,
                  suffixIcon: suffixIcon,
                  errorText: errorText,
                  errorMaxLines: 3,
                  hintText: hintText,
                  hintStyle: TextStyle(
                    color: AppColors.HINT_GREY,
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                  )),
              style: TextStyle(fontSize: 16, letterSpacing: 0),
              obscureText: obscureText,
              keyboardType: keyboardType,
              maxLines: maxLine,
              key: key,
              onChanged: (value) {
                onChanged!(value);
              },
              initialValue: initialValue,
            ),
          ),
        ),
      ],
    );
  }
}
