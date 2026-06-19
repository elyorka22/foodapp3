import 'package:flutter/material.dart';

class PasswordTextField extends StatefulWidget {
  const PasswordTextField({
    super.key,
    required this.controller,
    this.labelText,
    this.hintText,
    this.textInputAction,
    this.onSubmitted,
  });

  final TextEditingController controller;
  final String? labelText;
  final String? hintText;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;

  @override
  State<PasswordTextField> createState() => _PasswordTextFieldState();
}

class _PasswordTextFieldState extends State<PasswordTextField> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: widget.controller,
      obscureText: _obscured,
      textInputAction: widget.textInputAction,
      onSubmitted: widget.onSubmitted,
      decoration: InputDecoration(
        labelText: widget.labelText,
        hintText: widget.hintText,
        suffixIcon: IconButton(
          icon: Icon(_obscured ? Icons.visibility_off_outlined : Icons.visibility_outlined),
          onPressed: () => setState(() => _obscured = !_obscured),
        ),
      ),
    );
  }
}
