import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class FormInput extends StatelessWidget {
  final String label;
  final bool obscureText;
  final TextInputType? keyboardType;
  final Icon? prefixIcon;
  final Widget? suffixIcon;
  final Key? key;
  final String? errorText;
  final Function(String? value) onChanged;
  final FocusNode? focusNode;
  final String? initialValue;
  final String? hintText;
  final bool isEnabled;
  final int maxLine;
  final double formRadius;
  final Color borderColor;
  final bool isDense;
  final double suffixIconMinimumHeightWidth;
  final double textFieldHeight;
  final TextEditingController textEditingController;
  final Function(String)? onFieldSubmitted;
  final TextInputAction? textInputAction;

  FormInput({
    required this.label,
    this.obscureText = false,
    this.keyboardType,
    this.prefixIcon,
    this.suffixIcon,
    this.key,
    this.isEnabled = true,
    this.isDense = false,
    this.suffixIconMinimumHeightWidth = 48,
    this.maxLine = 1,
    this.errorText,
    this.formRadius = 4,
    this.borderColor = Colors.grey,
    required this.onChanged,
    this.focusNode,
    this.initialValue,
    required this.hintText,
    this.textFieldHeight = 0,
    required this.textEditingController,
    this.onFieldSubmitted,
    this.textInputAction,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      child: TextFormField(
        controller: textEditingController,
        focusNode: focusNode,
        enabled: isEnabled,
        textInputAction: textInputAction,
        onFieldSubmitted: onFieldSubmitted,
        decoration: InputDecoration(
          filled: true,
          focusColor: Colors.red,
          fillColor: Colors.white,
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(
              formRadius,
            ),
            borderSide: BorderSide(width: 0, color: borderColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(
              formRadius,
            ),
            borderSide: BorderSide(width: 0, color: borderColor),
          ),
          contentPadding: EdgeInsets.symmetric(
            vertical: textFieldHeight,
            horizontal: 10,
          ),
          prefixIcon: prefixIcon,
          suffixIcon: suffixIcon,
          isDense: isDense,
          suffixIconConstraints: BoxConstraints(
            minHeight: suffixIconMinimumHeightWidth,
            minWidth: suffixIconMinimumHeightWidth,
          ),
          errorText: errorText,
          errorMaxLines: 3,
          hintText: hintText,
        ),
        style: GoogleFonts.roboto(
          textStyle: TextStyle(
            fontSize: 14,
            letterSpacing: 0.7,
          ),
        ),
        obscureText: obscureText,
        keyboardType: keyboardType,
        maxLines: maxLine,
        key: key,
        onChanged: onChanged,
        initialValue: initialValue,
      ),
    );
  }
}
