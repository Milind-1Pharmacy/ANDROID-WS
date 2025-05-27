Pod::Spec.new do |s|
  s.name         = "fmt"
  s.version      = "6.2.1"
  s.summary      = "A modern formatting library"
  s.homepage     = "https://github.com/fmtlib/fmt"
#   s.license      = { :type => "MIT", :file => "LICENSE.rst" }
  s.author       = { "Victor Zverovich" => "victor.zverovich@gmail.com" }
  s.source       = { :git => "https://github.com/fmtlib/fmt.git", :tag => "6.2.1" }
  s.header_dir   = "fmt"
  s.source_files = "include/**/*.h"
  s.pod_target_xcconfig = {
    "GCC_PREPROCESSOR_DEFINITIONS" => "FMT_HEADER_ONLY=1 FMT_DISABLE_CHAR8_T=1"
  }
#   s.module_map   = "include/fmt/module.modulemap"
end
