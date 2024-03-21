#include <iostream>
#include <filesystem>
#include <fstream>

// C++ cli tool to join all files in a directory

void joinFiles(const std::string& directoryPath, const std::string& outputFile) {
    // Check if the output file exists, create it if it doesn't
    if (!std::filesystem::exists(outputFile)) {
        std::ofstream createFile(outputFile);

        if (!createFile) {
            std::cerr << "Error: Unable to create output file\n";
            return;
        }
    }

    std::ofstream output(outputFile, std::ios::binary);

    if (!output) {
        std::cerr << "Error: Unable to create output file\n";
        return;
    }

    // Loop to combine videos

    for (const auto& entry : std::filesystem::directory_iterator(directoryPath)) {
        if (std::filesystem::is_regular_file(entry)) {
            std::ifstream input(entry.path(), std::ios::binary);

            if (!input) {
                std::cerr << "Error: Unable to open file " << entry.path() << '\n';
                continue;
            }

            output << input.rdbuf();
            
            input.close();
        }
    }

    output.close();
}

// Main entry point

int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "Usage: " << argv[0] << " <input_directory> <output_file_name> \n";
        return 1;
    }

    std::string directoryPath = argv[1];
    std::string outputFile = argv[2];

    joinFiles(directoryPath, outputFile);

    std::cout << "Files joined successfully\n";

    return 0;
}
