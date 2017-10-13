import java.awt.*;
import java.io.File;

public class startUp
{
    public static void main(String[] args)
    {
        System.out.println("start");
        try
        {
            File generateHTML = new File
                    ("C:\\Users\\Tobi\\IdeaProjects\\RPG Cards Generator\\RPG Cards Main\\generator\\generate.html");
            Desktop.getDesktop().browse(generateHTML.toURI());
            System.out.println("yep");
        } catch (Exception e)
        {
            e.printStackTrace();
            System.out.println("nope");
        }
    }
}