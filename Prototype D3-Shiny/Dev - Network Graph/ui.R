dynGraph <- function(inputoutputId) 
{
  div(id = inputoutputId, class="d3graph")
}

shinyUI(pageWithSidebar(
  
  headerPanel("Interactive Graph"),
  
  sidebarPanel(
    includeHTML("scripts/graph_2.js"),
    uiOutput("choose_dataset"),    
    #uiOutput("choose_layout"),
    p("User Selection"),
    tableOutput('d3summary'),
    helpText(HTML("All source available on <a href = \"https://github.com/andeek/Community-Detection/tree/master/Prototype%20D3-Shiny/Network%20Graph\" target=\"_blank\">Github</a>"))
  ),
  
  mainPanel(    
    tabsetPanel(      
      tabPanel("Graph", dynGraph(inputoutputId = 'd3io')),
      tabPanel("Groups", htmlOutput("groupTable"))
    )
  )
))
